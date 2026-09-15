import { useState, useEffect } from 'react';
import { gateApi, GateRevisionItem } from './api';
import { PlusCircle, Search, Filter, Calendar, CheckCircle2, RotateCcw, Clock, ArrowRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

export function GateRevisionHub() {
    const [items, setItems] = useState<GateRevisionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState<'ALL' | 'TODAY' | 'OVERDUE' | 'UPCOMING'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');

    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [reschedulingId, setReschedulingId] = useState<string | null>(null);
    const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        loadItems();
    }, [filterDate, filterStatus]);

    const loadItems = async () => {
        try {
            setIsLoading(true);
            const data = await gateApi.getGateRevisions({ dateFilter: filterDate, status: filterStatus });
            setItems(data);
        } catch (error) {
            console.error('Failed to load revision items', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await gateApi.completeGateRevision(id);
            await loadItems();
        } catch (error) {
            console.error('Failed to complete item', error);
        }
    };

    const handleReview = async (id: string) => {
        try {
            await gateApi.reviewGateRevision(id);
            await loadItems();
        } catch (error) {
            console.error('Failed to review item', error);
        }
    };

    const handleReopen = async (id: string) => {
        try {
            await gateApi.reopenGateRevision(id);
            await loadItems();
        } catch (error) {
            console.error('Failed to reopen item', error);
        }
    };

    const openRescheduleModal = (id: string, currentDate: string) => {
        setReschedulingId(id);
        setNewDate(format(new Date(currentDate), 'yyyy-MM-dd'));
        setIsRescheduleModalOpen(true);
    };

    const handleReschedule = async () => {
        if (!reschedulingId) return;
        try {
            await gateApi.rescheduleGateRevision(reschedulingId, new Date(newDate).toISOString());
            setIsRescheduleModalOpen(false);
            await loadItems();
        } catch (error) {
            console.error('Failed to reschedule item', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revision Hub</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manually managed revision tracking for topics, mistakes, and practice.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-lg">
                <Select
                    label="Status Filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    options={[
                        { value: 'ALL', label: 'All Status' },
                        { value: 'PENDING', label: 'Pending' },
                        { value: 'COMPLETED', label: 'Completed' }
                    ]}
                />
                <Select
                    label="Time Filter"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value as any)}
                    options={[
                        { value: 'ALL', label: 'All Time' },
                        { value: 'TODAY', label: 'Due Today' },
                        { value: 'OVERDUE', label: 'Overdue' },
                        { value: 'UPCOMING', label: 'Upcoming' }
                    ]}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center p-12 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <p className="text-lg font-medium">No revision items found</p>
                    <p className="text-sm text-muted-foreground mt-1">Nothing to show here. Add items from Mistakes or Practice pages.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {items.map(item => (
                        <div key={item.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        {item.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-orange-500" />
                                        )}
                                        {item.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                        <span className={`px-2 py-1 rounded-full ${item.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {item.priority} Priority
                                        </span>
                                        <span className="px-2 py-1 bg-secondary rounded-full flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Due: {format(new Date(item.scheduledDate), 'MMM d, yyyy')}
                                        </span>
                                        <span className="px-2 py-1 bg-secondary rounded-full">
                                            Reviews: {item.reviewCount}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {item.status === 'PENDING' ? (
                                        <>
                                            <button
                                                onClick={() => handleReview(item.id)}
                                                className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                                            >
                                                Log Review
                                            </button>
                                            <button
                                                onClick={() => handleComplete(item.id)}
                                                className="px-3 py-1.5 text-sm font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-md transition-colors"
                                            >
                                                Complete
                                            </button>
                                            <Button
                                                variant="outline" size="sm"
                                                onClick={() => openRescheduleModal(item.id, item.scheduledDate)}
                                            >
                                                <CalendarDays className="w-4 h-4 mr-1" /> Reschedule
                                            </Button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleReopen(item.id)}
                                            className="px-3 py-1.5 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                                        >
                                            Reopen
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isRescheduleModalOpen} onClose={() => setIsRescheduleModalOpen(false)} title="Reschedule Revision" size="sm">
                <div className="px-1 py-1 space-y-4">
                    <p className="text-sm text-slate-500">Pick a new date for this revision item.</p>
                    <Input type="date" label="New Scheduled Date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => void handleReschedule()}>Save New Date</Button>
                </div>
            </Modal>
        </div>
    );
}
