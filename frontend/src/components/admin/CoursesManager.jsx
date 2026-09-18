import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Pencil, X, Loader2, ChevronDown, ChevronUp, Video, FileText,
  FlaskConical, Users, Save, GripVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { courseApi } from '@/services/courseService';
import { DOMAINS } from '@/config/company';

const EMPTY_COURSE = {
  title: '',
  subtitle: '',
  description: '',
  thumbnail: '',
  domain: 'full-stack',
  level: 'Beginner',
  language: 'English',
  instructorName: '',
  instructorTitle: '',
  tags: '',
  whatYouWillLearn: '',
  requirements: '',
  isPaid: false,
  price: 0,
  discountPrice: 0,
  status: 'draft',
  isFeatured: false,
  certificateEnabled: true,
  modules: []
};

const LESSON_ICON = { video: Video, document: FileText, text: FileText, lab: FlaskConical };

function toForm(course) {
  return {
    ...EMPTY_COURSE,
    ...course,
    tags: (course.tags || []).join(', '),
    whatYouWillLearn: (course.whatYouWillLearn || []).join('\n'),
    requirements: (course.requirements || []).join('\n'),
    modules: course.modules || []
  };
}

function fromForm(form) {
  const split = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
  return {
    ...form,
    tags: String(form.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    whatYouWillLearn: split(form.whatYouWillLearn),
    requirements: split(form.requirements),
    price: Number(form.price) || 0,
    discountPrice: Number(form.discountPrice) || 0,
    modules: (form.modules || []).map((m, mi) => ({
      ...m,
      order: mi,
      lessons: (m.lessons || []).map((l, li) => ({
        ...l,
        order: li,
        durationMinutes: Number(l.durationMinutes) || 0
      }))
    }))
  };
}

const input =
  'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-orange-500';
const label = 'block text-xs font-medium text-muted-foreground mb-1.5';

export default function CoursesManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // form object or null
  const [saving, setSaving] = useState(false);
  const [openModule, setOpenModule] = useState(0);
  const [roster, setRoster] = useState(null);
  // Tracks in-progress video uploads keyed by "moduleIndex-lessonIndex" -> { name, progress } | null
  const [videoUploads, setVideoUploads] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      setCourses(await courseApi.adminGetAll());
    } catch {
      toast.error('Could not load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing.title || !editing.description) {
      toast.error('Title and description are required');
      return;
    }
    setSaving(true);
    try {
      const payload = fromForm(editing);
      if (editing._id) await courseApi.update(editing._id, payload);
      else await courseApi.create(payload);
      toast.success(editing._id ? 'Course updated' : 'Course created');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete "${course.title}" and all its enrollments?`)) return;
    try {
      await courseApi.remove(course._id);
      toast.success('Course deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const showRoster = async (course) => {
    try {
      const data = await courseApi.enrollments(course._id);
      setRoster({ course, enrollments: data });
    } catch {
      toast.error('Could not load the roster');
    }
  };

  /* ------------------------- module / lesson helpers ------------------------ */
  const patchModules = (fn) => setEditing((e) => ({ ...e, modules: fn(e.modules || []) }));

  const addModule = () =>
    patchModules((ms) => [...ms, { title: `Module ${ms.length + 1}`, summary: '', lessons: [] }]);

  const updateModule = (mi, patch) =>
    patchModules((ms) => ms.map((m, i) => (i === mi ? { ...m, ...patch } : m)));

  const removeModule = (mi) => patchModules((ms) => ms.filter((_, i) => i !== mi));

  const moveModule = (mi, dir) =>
    patchModules((ms) => {
      const next = [...ms];
      const t = next[mi + dir];
      if (!t) return ms;
      next[mi + dir] = next[mi];
      next[mi] = t;
      return next;
    });

  const addLesson = (mi) =>
    updateModule(mi, {
      lessons: [
        ...(editing.modules[mi].lessons || []),
        { title: 'New lesson', type: 'video', videoUrl: '', videoPublicId: '', resourceUrl: '', content: '', durationMinutes: 0, isPreview: false }
      ]
    });

  const updateLesson = (mi, li, patch) =>
    updateModule(mi, {
      lessons: editing.modules[mi].lessons.map((l, i) => (i === li ? { ...l, ...patch } : l))
    });

  const removeLesson = (mi, li) =>
    updateModule(mi, { lessons: editing.modules[mi].lessons.filter((_, i) => i !== li) });

  const MAX_VIDEO_MB = 200; // keep in sync with backend/middleware/upload.js -> uploadLessonVideoFile

  const handleVideoFileChange = async (mi, li, file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please choose a video file');
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video is too large — max ${MAX_VIDEO_MB}MB`);
      return;
    }
    const key = `${mi}-${li}`;
    setVideoUploads((prev) => ({ ...prev, [key]: { name: file.name, progress: 0 } }));
    try {
      const { videoUrl, publicId } = await courseApi.uploadVideo(file, (progress) => {
        setVideoUploads((prev) => ({ ...prev, [key]: { name: file.name, progress } }));
      });
      updateLesson(mi, li, { videoUrl, videoPublicId: publicId });
      toast.success('Video uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Video upload failed');
    } finally {
      setVideoUploads((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  /* --------------------------------- render -------------------------------- */

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">{editing._id ? 'Edit course' : 'New course'}</h2>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save course
            </button>
          </div>
        </div>

        {/* Basics */}
        <div className="rounded-2xl border border-border p-5 space-y-4">
          <h3 className="font-semibold text-sm">Course details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Title *</label>
              <input className={input} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className={label}>Subtitle</label>
              <input className={input} value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={label}>Description *</label>
            <textarea rows={4} className={input} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={label}>Domain</label>
              <select className={input} value={editing.domain} onChange={(e) => setEditing({ ...editing, domain: e.target.value })}>
                {DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Level</label>
              <select className={input} value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })}>
                {['Beginner', 'Intermediate', 'Advanced'].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Language</label>
              <input className={input} value={editing.language} onChange={(e) => setEditing({ ...editing, language: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Thumbnail URL</label>
              <input className={input} placeholder="https://…" value={editing.thumbnail} onChange={(e) => setEditing({ ...editing, thumbnail: e.target.value })} />
            </div>
            <div>
              <label className={label}>Tags (comma separated)</label>
              <input className={input} value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Instructor name</label>
              <input className={input} value={editing.instructorName} onChange={(e) => setEditing({ ...editing, instructorName: e.target.value })} />
            </div>
            <div>
              <label className={label}>Instructor title</label>
              <input className={input} value={editing.instructorTitle} onChange={(e) => setEditing({ ...editing, instructorTitle: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={label}>What you'll learn (one per line)</label>
              <textarea rows={4} className={input} value={editing.whatYouWillLearn} onChange={(e) => setEditing({ ...editing, whatYouWillLearn: e.target.value })} />
            </div>
            <div>
              <label className={label}>Requirements (one per line)</label>
              <textarea rows={4} className={input} value={editing.requirements} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isPaid} onChange={(e) => setEditing({ ...editing, isPaid: e.target.checked })} />
              Paid course
            </label>
            <div>
              <label className={label}>Price (₹)</label>
              <input type="number" className={input} value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
            </div>
            <div>
              <label className={label}>Discounted price (₹)</label>
              <input type="number" className={input} value={editing.discountPrice} onChange={(e) => setEditing({ ...editing, discountPrice: e.target.value })} />
            </div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isFeatured} onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} />
              Feature on homepage
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.certificateEnabled} onChange={(e) => setEditing({ ...editing, certificateEnabled: e.target.checked })} />
              Issue certificate on 100% completion
            </label>
          </div>
        </div>

        {/* Curriculum builder */}
        <div className="rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Curriculum</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add recorded sessions by pasting a YouTube, Vimeo, or direct MP4 link.
              </p>
            </div>
            <button onClick={addModule} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium hover:underline">
              <Plus className="w-4 h-4" /> Add module
            </button>
          </div>

          <div className="space-y-3">
            {(editing.modules || []).map((mod, mi) => {
              const open = openModule === mi;
              return (
                <div key={mi} className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/40">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      value={mod.title}
                      onChange={(e) => updateModule(mi, { title: e.target.value })}
                      className="flex-1 bg-transparent font-semibold text-sm focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground shrink-0">{mod.lessons?.length || 0} lessons</span>
                    <button onClick={() => moveModule(mi, -1)} className="p-1 text-muted-foreground hover:text-foreground" title="Move up"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={() => moveModule(mi, 1)} className="p-1 text-muted-foreground hover:text-foreground" title="Move down"><ChevronDown className="w-4 h-4" /></button>
                    <button onClick={() => setOpenModule(open ? -1 : mi)} className="px-2 py-1 text-xs rounded border border-border">
                      {open ? 'Collapse' : 'Expand'}
                    </button>
                    <button onClick={() => removeModule(mi)} className="p-1 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {open && (
                    <div className="p-4 space-y-3">
                      {(mod.lessons || []).map((l, li) => {
                        const Icon = LESSON_ICON[l.type] || Video;
                        return (
                          <div key={li} className="rounded-lg border border-border p-3 space-y-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-orange-500 shrink-0" />
                              <input
                                value={l.title}
                                onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                                className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                                placeholder="Lesson title"
                              />
                              <select
                                value={l.type}
                                onChange={(e) => updateLesson(mi, li, { type: e.target.value })}
                                className="text-xs px-2 py-1 rounded border border-border bg-background"
                              >
                                <option value="video">Recorded video</option>
                                <option value="document">Document</option>
                                <option value="text">Reading</option>
                                <option value="lab">Lab</option>
                              </select>
                              <button onClick={() => removeLesson(mi, li)} className="p-1 text-red-500 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {l.type === 'video' && (() => {
                              const key = `${mi}-${li}`;
                              const upload = videoUploads[key];
                              return (
                                <div className="space-y-2">
                                  <label
                                    htmlFor={`video-upload-${key}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-orange-500 cursor-pointer text-sm text-muted-foreground hover:text-orange-500 transition-colors"
                                  >
                                    <Video className="w-4 h-4 shrink-0" />
                                    {upload
                                      ? `Uploading “${upload.name}”… ${upload.progress}%`
                                      : l.videoUrl
                                      ? 'Replace video (from your device)'
                                      : 'Choose video file from device (mp4, mov, webm…)'}
                                  </label>
                                  <input
                                    id={`video-upload-${key}`}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    disabled={Boolean(upload)}
                                    onChange={(e) => {
                                      handleVideoFileChange(mi, li, e.target.files?.[0]);
                                      e.target.value = '';
                                    }}
                                  />
                                  {upload && (
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-orange-500 transition-all"
                                        style={{ width: `${upload.progress}%` }}
                                      />
                                    </div>
                                  )}
                                  {l.videoUrl && !upload && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="truncate">{l.videoUrl}</span>
                                      <button
                                        type="button"
                                        onClick={() => updateLesson(mi, li, { videoUrl: '', videoPublicId: '' })}
                                        className="text-red-500 hover:underline shrink-0"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                  <details className="text-xs text-muted-foreground">
                                    <summary className="cursor-pointer hover:text-orange-500">
                                      Or paste a YouTube / Vimeo link instead
                                    </summary>
                                    <input
                                      className={`${input} mt-2`}
                                      placeholder="https://youtube.com/watch?v=…"
                                      value={l.videoUrl}
                                      onChange={(e) => updateLesson(mi, li, { videoUrl: e.target.value, videoPublicId: '' })}
                                    />
                                  </details>
                                </div>
                              );
                            })()}

                            <div className="grid md:grid-cols-2 gap-3">
                              <input
                                className={input}
                                placeholder="Resource / download URL (optional)"
                                value={l.resourceUrl}
                                onChange={(e) => updateLesson(mi, li, { resourceUrl: e.target.value })}
                              />
                              <input
                                type="number"
                                className={input}
                                placeholder="Duration (minutes)"
                                value={l.durationMinutes}
                                onChange={(e) => updateLesson(mi, li, { durationMinutes: e.target.value })}
                              />
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input
                                  type="checkbox"
                                  checked={l.isPreview}
                                  onChange={(e) => updateLesson(mi, li, { isPreview: e.target.checked })}
                                />
                                Free preview (visible before enrolling)
                              </label>
                            </div>

                            {(l.type === 'text' || l.type === 'lab') && (
                              <textarea
                                rows={4}
                                className={input}
                                placeholder={l.type === 'lab' ? 'Lab instructions…' : 'Lesson notes…'}
                                value={l.content}
                                onChange={(e) => updateLesson(mi, li, { content: e.target.value })}
                              />
                            )}
                          </div>
                        );
                      })}

                      <button onClick={() => addLesson(mi)} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium hover:underline">
                        <Plus className="w-4 h-4" /> Add lesson
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {(editing.modules || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
                No modules yet — add your first one to start uploading recorded sessions.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Courses</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publish recorded sessions, labs, and reading material to the LMS.
          </p>
        </div>
        <button
          onClick={() => { setEditing({ ...EMPTY_COURSE }); setOpenModule(0); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-2xl">
          No courses yet. Create your first one to open the LMS to learners.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Domain</th>
                <th className="px-4 py-3 font-semibold">Lessons</th>
                <th className="px-4 py-3 font-semibold">Enrolled</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((c) => (
                <tr key={c._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">/courses/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.domain}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(c.modules || []).reduce((n, m) => n + (m.lessons?.length || 0), 0)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.enrolledCount || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      c.status === 'published' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : c.status === 'draft' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => showRoster(c)} className="p-2 text-muted-foreground hover:text-orange-500" title="Enrolled learners">
                        <Users className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditing(toForm(c)); setOpenModule(0); }} className="p-2 text-muted-foreground hover:text-orange-500" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(c)} className="p-2 text-muted-foreground hover:text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roster modal */}
      {roster && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setRoster(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-card border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold">{roster.course.title}</h3>
                <p className="text-xs text-muted-foreground">{roster.enrollments.length} enrolled learners</p>
              </div>
              <button onClick={() => setRoster(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            {roster.enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nobody has enrolled yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr><th className="py-2">Learner</th><th>Progress</th><th>Status</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roster.enrollments.map((e) => (
                    <tr key={e._id}>
                      <td className="py-2.5">
                        <p className="font-medium">{e.user?.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{e.user?.email}</p>
                      </td>
                      <td>{e.progressPercent}%</td>
                      <td className="capitalize text-muted-foreground">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
