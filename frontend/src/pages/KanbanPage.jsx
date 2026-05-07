import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import api from '../api/axios'
import toast from 'react-hot-toast'

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected']
const STAGE_COLORS = {
  Applied: 'border-blue-300 bg-blue-50',
  Shortlisted: 'border-yellow-300 bg-yellow-50',
  Interview: 'border-purple-300 bg-purple-50',
  Offer: 'border-green-300 bg-green-50',
  Rejected: 'border-red-300 bg-red-50',
}
const HEADER_COLORS = {
  Applied: 'text-blue-700', Shortlisted: 'text-yellow-700',
  Interview: 'text-purple-700', Offer: 'text-green-700', Rejected: 'text-red-700',
}

const emptyForm = { companyName: '', role: '', ctc: '', location: '', deadline: '', notes: '', jobDescriptionText: '' }

export default function KanbanPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetch = () => api.get('/applications').then(r => setApps(r.data)).finally(() => setLoading(false))
  useEffect(() => { fetch() }, [])

  const byStage = stage => apps.filter(a => a.stage === stage)

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return
    const newStage = destination.droppableId
    setApps(prev => prev.map(a => a._id === draggableId ? { ...a, stage: newStage } : a))
    try {
      await api.patch(`/applications/${draggableId}/stage`, { stage: newStage })
      toast.success(`Moved to ${newStage}`)
    } catch { fetch(); toast.error('Failed to update') }
  }

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (app) => {
    setForm({ companyName: app.companyName, role: app.role, ctc: app.ctc || '', location: app.location || '', deadline: app.deadline ? app.deadline.slice(0, 10) : '', notes: app.notes || '', jobDescriptionText: app.jobDescriptionText || '' })
    setEditId(app._id); setShowModal(true)
  }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) { const r = await api.put(`/applications/${editId}`, form); setApps(p => p.map(a => a._id === editId ? r.data : a)); toast.success('Updated') }
      else { const r = await api.post('/applications', form); setApps(p => [r.data, ...p]); toast.success('Application added') }
      setShowModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this application?')) return
    await api.delete(`/applications/${id}`)
    setApps(p => p.filter(a => a._id !== id))
    toast.success('Deleted')
  }

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Application tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Drag cards to update status</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add application</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <div key={stage} className="flex-none w-64">
              <div className={`flex items-center justify-between mb-2 px-1`}>
                <span className={`text-sm font-semibold ${HEADER_COLORS[stage]}`}>{stage}</span>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{byStage(stage).length}</span>
              </div>
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef} {...provided.droppableProps}
                    className={`min-h-40 rounded-xl border-2 p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? STAGE_COLORS[stage] : 'border-slate-100 bg-slate-50'}`}
                  >
                    {byStage(stage).map((app, index) => (
                      <Draggable key={app._id} draggableId={app._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            className={`bg-white rounded-lg border border-slate-100 p-3 shadow-sm cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-md rotate-1' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-slate-800 truncate">{app.companyName}</p>
                                <p className="text-xs text-slate-500 truncate">{app.role}</p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => openEdit(app)} className="text-slate-300 hover:text-indigo-500 text-xs p-1">✎</button>
                                <button onClick={() => remove(app._id)} className="text-slate-300 hover:text-red-400 text-xs p-1">✕</button>
                              </div>
                            </div>
                            {app.ctc > 0 && <p className="text-xs text-green-600 font-medium mt-2">₹{(app.ctc / 100000).toFixed(1)} LPA</p>}
                            {app.deadline && (
                              <p className="text-xs text-slate-400 mt-1">
                                Due {new Date(app.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                            {app.aiMatchScore !== null && app.aiMatchScore !== undefined && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                                  <div className={`h-1.5 rounded-full ${app.aiMatchScore >= 70 ? 'bg-green-400' : app.aiMatchScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${app.aiMatchScore}%` }} />
                                </div>
                                <span className="text-xs text-slate-500">{app.aiMatchScore}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">{editId ? 'Edit application' : 'Add application'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company *</label>
                  <input name="companyName" value={form.companyName} onChange={handle} className="input" placeholder="Google" required />
                </div>
                <div>
                  <label className="label">Role *</label>
                  <input name="role" value={form.role} onChange={handle} className="input" placeholder="SDE-1" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">CTC (₹)</label>
                  <input name="ctc" type="number" value={form.ctc} onChange={handle} className="input" placeholder="1200000" />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input name="location" value={form.location} onChange={handle} className="input" placeholder="Bangalore" />
                </div>
              </div>
              <div>
                <label className="label">Deadline</label>
                <input name="deadline" type="date" value={form.deadline} onChange={handle} className="input" />
              </div>
              <div>
                <label className="label">Job description (for AI analysis)</label>
                <textarea name="jobDescriptionText" value={form.jobDescriptionText} onChange={handle} className="input min-h-24 resize-none" placeholder="Paste the job description here..." />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handle} className="input resize-none" placeholder="Referral from..., Round 1 cleared..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
