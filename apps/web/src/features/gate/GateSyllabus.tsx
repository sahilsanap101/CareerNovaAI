import { useState, useEffect } from 'react';
import { gateApi, type GatePersonalTopic, type GateTopicInput, type GateProfile } from './api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { ExternalLink, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'LEARNING', label: 'Learning' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'NEEDS_REVISION', label: 'Needs Revision' },
];

const PRIORITY_OPTIONS = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
];

export function GateSyllabus() {
    const [topics, setTopics] = useState<GatePersonalTopic[]>([]);
    const [profile, setProfile] = useState<GateProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTopic, setCurrentTopic] = useState<GatePersonalTopic | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const [formData, setFormData] = useState<GateTopicInput>({
        title: '',
        subject: '',
        notes: '',
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        targetDate: ''
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [fetchedTopics, fetchedProfile] = await Promise.all([
                gateApi.getTopics(),
                gateApi.getProfile()
            ]);
            setTopics(fetchedTopics || []);
            setProfile(fetchedProfile);
        } catch (err) {
            toast.error('Unable to load your topics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, []);

    const handleOpenModal = (topic?: GatePersonalTopic) => {
        if (topic) {
            setCurrentTopic(topic);
            setFormData({
                title: topic.title,
                subject: topic.subject,
                notes: topic.notes || '',
                status: topic.status,
                priority: topic.priority,
                targetDate: topic.targetDate ? (topic.targetDate.split('T')[0] || '') : ''
            });
        } else {
            setCurrentTopic(null);
            setFormData({
                title: '',
                subject: '',
                notes: '',
                status: 'NOT_STARTED',
                priority: 'MEDIUM',
                targetDate: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentTopic) {
                await gateApi.updateTopic(currentTopic.id, formData);
                toast.success('Topic updated!');
            } else {
                await gateApi.createTopic(formData);
                toast.success('Topic added!');
            }
            setIsModalOpen(false);
            void fetchData();
        } catch (err) {
            toast.error('Unable to save this topic. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this topic?')) return;
        try {
            await gateApi.deleteTopic(id);
            toast.success('Topic deleted');
            void fetchData();
        } catch {
            toast.error('Unable to delete topic');
        }
    };

    const handleStatusChange = async (topic: GatePersonalTopic, newStatus: string) => {
        try {
            await gateApi.updateTopic(topic.id, {
                title: topic.title,
                subject: topic.subject,
                notes: topic.notes,
                priority: topic.priority,
                targetDate: topic.targetDate,
                status: newStatus as any
            });
            void fetchData();
        } catch {
            toast.error('Unable to update topic status');
        }
    };

    const handlePriorityChange = async (topic: GatePersonalTopic, newPriority: string) => {
        try {
            await gateApi.updateTopic(topic.id, {
                title: topic.title,
                subject: topic.subject,
                notes: topic.notes,
                status: topic.status,
                targetDate: topic.targetDate,
                priority: newPriority as any
            });
            void fetchData();
        } catch {
            toast.error('Unable to update topic priority');
        }
    };

    const filteredTopics = topics.filter(t => {
        if (statusFilter && t.status !== statusFilter) return false;
        if (priorityFilter && t.priority !== priorityFilter) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const getSyllabusLink = () => {
        if (!profile) return 'https://gate2027.iitm.ac.in/exam_papers_and_syllabus';
        return profile.gateYear === 2027
            ? 'https://gate2027.iitm.ac.in/exam_papers_and_syllabus'
            : 'https://gate2026.iitr.ac.in/syllabus.html'; // Valid GATE 2026 Official Archive
    };

    if (loading && topics.length === 0) return <Loader />;

    return (
        <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-primary-500 flex justify-between items-center bg-primary-50/50 dark:bg-primary-900/10">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Official GATE {profile?.gateYear || 2027} Syllabus</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">View the official syllabus for your selected GATE paper.</p>
                </div>
                <a href={getSyllabusLink()} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Open Official Syllabus
                    <ExternalLink className="ml-2 w-4 h-4" />
                </a>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                    <Input
                        placeholder="Search topics..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                        className="w-full sm:w-64"
                    />
                    <Select
                        options={[{ value: '', label: 'All Statuses' }, ...STATUS_OPTIONS]}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    <Select
                        options={[{ value: '', label: 'All Priorities' }, ...PRIORITY_OPTIONS]}
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    />
                </div>
                <Button onClick={() => handleOpenModal()} className="shrink-0 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-2" /> Add Topic
                </Button>
            </div>

            <div className="space-y-4">
                {topics.length === 0 ? (
                    <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No personal topics yet.</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mb-6">Use the official GATE syllabus to identify what you need to study, then add your topics here to track your preparation.</p>
                        <div className="flex gap-4">
                            <a href={getSyllabusLink()} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Open Official Syllabus
                            </a>
                            <Button onClick={() => handleOpenModal()}>Add Topic</Button>
                        </div>
                    </Card>
                ) : filteredTopics.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No topics match your filters.</div>
                ) : (
                    filteredTopics.map(topic => (
                        <Card key={topic.id} className={`p-5 flex flex-col md:flex-row justify-between gap-4 border-l-4 ${topic.priority === 'HIGH' ? 'border-l-red-500' : topic.priority === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                            <div className="flex-1">
                                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">{topic.subject}</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{topic.title}</h3>
                                {topic.notes && <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">{topic.notes}</p>}
                                {topic.targetDate && <p className="text-xs text-slate-500 mt-2">Target Date: {new Date(topic.targetDate).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                                <select
                                    className="text-sm rounded border-slate-300 dark:border-slate-700 bg-transparent dark:text-slate-200 h-9"
                                    value={topic.status}
                                    onChange={(e) => handleStatusChange(topic, e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <select
                                    className="text-sm rounded border-slate-300 dark:border-slate-700 bg-transparent dark:text-slate-200 h-9"
                                    value={topic.priority}
                                    onChange={(e) => handlePriorityChange(topic, e.target.value)}
                                >
                                    {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenModal(topic)} className="p-2 text-slate-400 hover:text-primary-500 transition-colors" title="Edit">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(topic.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentTopic ? 'Edit Topic' : 'Add Topic'}>
                <form onSubmit={handleSaveTopic} className="space-y-5">
                    <Input label="Topic Name" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    <Input label="Subject" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                    <Select label="Status" required options={STATUS_OPTIONS} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} />
                    <Select label="Priority" required options={PRIORITY_OPTIONS} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as any })} />
                    <Input label="Target Date (Optional)" type="date" value={formData.targetDate || ''} onChange={e => setFormData({ ...formData, targetDate: e.target.value })} />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (Optional)</label>
                        <textarea
                            className="w-full input-base min-h-[100px] resize-y p-3 rounded-md border"
                            value={formData.notes || ''}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Topic</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
