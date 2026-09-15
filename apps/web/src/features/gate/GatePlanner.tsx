import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight, Play, CheckCircle2, Circle } from 'lucide-react';
import { gateApi, type GateStudyTask, type GateStudyTaskInput, type WeeklyPlannerSummary, type GatePersonalTopic } from './api';
import { Loader } from '@/components/ui/Loader';
import { clsx } from 'clsx';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';

export function GatePlanner() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const [tasks, setTasks] = useState<GateStudyTask[]>([]);
    const [summary, setSummary] = useState<WeeklyPlannerSummary | null>(null);
    const [topics, setTopics] = useState<GatePersonalTopic[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<GateStudyTaskInput>({
        title: '',
        description: '',
        topicId: '',
        plannedDate: new Date().toISOString().split('T')[0] || '',
        estimatedMinutes: 60,
        priority: 'MEDIUM'
    });

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [fetchedTasks, fetchedSummary, fetchedTopics] = await Promise.all([
                gateApi.getStudyTasks(weekStart.toISOString(), weekEnd.toISOString()),
                gateApi.getWeeklySummary(weekStart.toISOString(), weekEnd.toISOString()),
                gateApi.getTopics() // Optional: Fetch only once in reality, but keeping it simple
            ]);
            setTasks(fetchedTasks);
            setSummary(fetchedSummary);
            setTopics(fetchedTopics);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchData();
    }, [currentDate]);

    const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
    const handlePrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
    const handleCurrentWeek = () => setCurrentDate(new Date());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                topicId: formData.topicId || null
            };
            await gateApi.createStudyTask(payload);
            setShowForm(false);
            setFormData({ title: '', description: '', topicId: '', plannedDate: new Date().toISOString().split('T')[0] || '', estimatedMinutes: 60, priority: 'MEDIUM' });
            await fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: GateStudyTask['status']) => {
        try {
            await gateApi.updateStudyTask(taskId, { status: newStatus });
            await fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('Delete this study task?')) return;
        try {
            await gateApi.deleteStudyTask(taskId);
            await fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading && !summary) return <Loader />;

    return (
        <div className="space-y-6">
            {summary && !summary.hasProfile && (
                <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500">
                    <div className="flex items-center text-amber-700 dark:text-amber-400">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Set up your GATE preparation profile first to link a weekly target.</span>
                    </div>
                </Card>
            )}

            {/* Week Navigation */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <div className="text-center">
                    <div className="font-bold text-slate-900 dark:text-white">
                        {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
                    </div>
                    <button onClick={handleCurrentWeek} className="text-xs text-primary-600 hover:underline">This Week</button>
                </div>
                <Button variant="outline" size="sm" onClick={handleNextWeek}>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div>

            {/* Weekly Overview */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Weekly Target</div>
                        <div className="text-xl font-bold">{summary.weeklyTargetMinutes ? `${Math.floor(summary.weeklyTargetMinutes / 60)} hrs` : 'Not Set'}</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Planned</div>
                        <div className="text-xl font-bold">{Math.floor(summary.plannedMinutes / 60)}h {summary.plannedMinutes % 60}m</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Completed</div>
                        <div className="text-xl font-bold text-green-600">{Math.floor(summary.completedMinutes / 60)}h {summary.completedMinutes % 60}m</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-sm text-slate-500">Remaining Planned</div>
                        <div className="text-xl font-bold text-amber-600">{Math.floor(summary.remainingMinutes / 60)}h {summary.remainingMinutes % 60}m</div>
                    </Card>
                </div>
            )}

            {/* Progress Bar */}
            {summary && (
                <Card className="p-4 shadow-sm border dark:border-slate-800">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-slate-700 dark:text-slate-300">Weekly Task Progress</span>
                        <span className="text-primary-600 dark:text-primary-400">{summary.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div
                            className="bg-primary-600 h-full transition-all duration-500"
                            style={{ width: `${Math.min(summary.completionPercentage, 100)}%` }}
                        />
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        {Math.floor(summary.completedMinutes / 60)}h {summary.completedMinutes % 60}m / {Math.floor(summary.plannedMinutes / 60)}h {summary.plannedMinutes % 60}m completed
                    </div>
                </Card>
            )}

            {/* Action Header */}
            <div className="flex justify-between items-center mt-6">
                <h2 className="text-lg font-bold">Planned Tasks</h2>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Study Task'}
                </Button>
            </div>

            {/* Task Form */}
            {showForm && (
                <Card className="p-5 border-2 border-primary-100 dark:border-primary-900/50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Task Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <Select
                                label="Link to Personal Topic (Optional)"
                                value={formData.topicId || ''}
                                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                                options={[
                                    { value: '', label: 'General / No Topic' },
                                    ...topics.map(t => ({ value: t.id, label: t.title }))
                                ]}
                            />
                            <Input
                                type="date"
                                label="Planned Date"
                                value={formData.plannedDate}
                                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                                required
                            />
                            <Input
                                type="number"
                                label="Estimated Duration (Minutes)"
                                min={1}
                                value={formData.estimatedMinutes}
                                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                                required
                            />
                            <Select
                                label="Priority"
                                value={formData.priority || 'MEDIUM'}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                options={[
                                    { value: 'LOW', label: 'Low - Routine' },
                                    { value: 'MEDIUM', label: 'Medium - Important' },
                                    { value: 'HIGH', label: 'High - Critical' },
                                ]}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit">Save Task</Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Task List */}
            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <Card className="p-8 text-center bg-slate-50 dark:bg-slate-900 border-dashed">
                        <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                        <h3 className="text-md font-medium text-slate-800 dark:text-slate-200">No study tasks planned for this week.</h3>
                        <p className="text-sm text-slate-500 mb-4">Add your first task to start building your preparation plan.</p>
                        <Button size="sm" onClick={() => setShowForm(true)}>+ Add Study Task</Button>
                    </Card>
                ) : (
                    tasks.map(task => (
                        <Card key={task.id} className={clsx(
                            "p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 transition-colors hover:shadow-sm",
                            task.status === 'COMPLETED' ? 'border-l-green-500 opacity-60' : 'border-l-primary-500'
                        )}>
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={clsx(
                                        "text-[10px] uppercase font-bold px-2 py-0.5 rounded",
                                        task.priority === 'HIGH' ? "bg-red-100 text-red-700" :
                                            task.priority === 'MEDIUM' ? "bg-amber-100 text-amber-700" :
                                                "bg-slate-100 text-slate-700"
                                    )}>{task.priority}</span>
                                    {task.topic && (
                                        <span className="text-xs font-semibold text-slate-500">{task.topic.subject}</span>
                                    )}
                                </div>
                                <h4 className={clsx(
                                    "font-bold text-md mb-1",
                                    task.status === 'COMPLETED' ? "line-through text-slate-500" : "text-slate-900 dark:text-white"
                                )}>{task.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                    <div className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(new Date(task.plannedDate), 'MMM d, yyyy')}</div>
                                    <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {task.estimatedMinutes} min</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 dark:border-slate-800">
                                {task.status === 'COMPLETED' ? (
                                    <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')} className="flex-1 md:flex-none whitespace-nowrap">
                                        <ChevronLeft className="w-3 h-3 mr-1" /> Mark Incomplete
                                    </Button>
                                ) : task.status === 'IN_PROGRESS' ? (
                                    <Button size="sm" onClick={() => updateTaskStatus(task.id, 'COMPLETED')} className="flex-1 md:flex-none whitespace-nowrap bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')} className="flex-1 md:flex-none whitespace-nowrap border-primary-200 text-primary-700">
                                        <Play className="w-3 h-3 mr-1" /> Start
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">Delete</Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

        </div>
    );
}
