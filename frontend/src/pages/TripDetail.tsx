import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  Share2, 
  FileText, 
  CheckSquare,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  Circle,
  FileDown
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { tripService } from '../services/tripService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Swipeable } from '../components/ui/Swipeable';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'notes' | 'checklist'>('itinerary');

  useEffect(() => {
    if (id) loadTrip(id);
  }, [id]);

  const loadTrip = async (tripId: string) => {
    try {
      setLoading(true);
      const response = await tripService.getTripById(tripId);
      setTrip(response.data);
    } catch (error) {
      console.error('Failed to load trip:', error);
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-white/40">Loading adventure details...</div>;
  if (!trip) return null;

  // Group activities by date
  const groupedActivities = (trip.activities || []).reduce((acc: any, activity: any) => {
    const dateKey = new Date(activity.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(activity);
    return acc;
  }, {});

  const budgetData = [
    { name: 'Transport', value: 400 },
    { name: 'Food', value: 300 },
    { name: 'Activities', value: 500 },
    { name: 'Shopping', value: 200 },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Header */}
      <section className="relative h-[300px] md:h-[400px] rounded-[32px] md:rounded-[40px] overflow-hidden">
        <img 
          src={trip.coverImage || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200`} 
          alt={trip.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
        
        <div className="absolute top-4 md:top-8 left-4 md:left-8">
          <Button 
            variant="secondary" 
            size="sm" 
            className="backdrop-blur-md bg-white/10 h-10 w-10 md:w-auto md:px-4 p-0" 
            onClick={() => navigate('/trips')}
            icon={<ArrowLeft size={16} />}
          >
            <span className="hidden md:inline">Back to Trips</span>
          </Button>
        </div>

        <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 right-6 md:right-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 md:space-y-4">
            <div className="flex gap-2">
              <Badge variant="primary" className="text-[10px] md:text-xs">Upcoming</Badge>
              {trip.isPublic && <Badge variant="secondary" className="text-[10px] md:text-xs">Public</Badge>}
            </div>
            <h1 className="text-3xl md:text-6xl font-bold text-white font-outfit leading-tight">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/70 text-xs md:text-base">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-primary md:size-18" /> {new Date(trip.startDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><MapPin size={16} className="text-primary md:size-18" /> {trip.activities?.length || 0} Places</span>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-3">
            <Button variant="secondary" size="sm" className="flex-1 md:flex-none" icon={<Share2 size={16} />}>Share</Button>
            <Button size="sm" className="flex-1 md:flex-none" icon={<Edit3 size={16} />}>Edit</Button>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex p-1 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md sticky top-4 z-20 overflow-x-auto scroll-hide">
        {[
          { id: 'itinerary', label: 'Itinerary', icon: Calendar },
          { id: 'budget', label: 'Budget', icon: TrendingUp },
          { id: 'notes', label: 'Notes', icon: FileText },
          { id: 'checklist', label: 'Checklist', icon: CheckSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-1 items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <tab.icon size={16} className="md:size-18" />
            <span className={activeTab === tab.id ? 'inline' : 'hidden md:inline'}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'itinerary' && (
            <div className="space-y-8 md:space-y-12 max-w-4xl">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl md:text-2xl font-bold text-white font-outfit">Trip Timeline</h2>
                <Button variant="secondary" size="sm" className="hidden md:flex" icon={<Plus size={16} />}>Add Activity</Button>
              </div>

              {Object.keys(groupedActivities).length > 0 ? (
                Object.entries(groupedActivities).map(([date, activities]: [string, any], idx) => (
                  <div key={date} className="relative pl-8 md:pl-12 before:absolute before:left-3 md:left-4 before:top-4 before:bottom-0 before:w-[2px] before:bg-white/5">
                    <div className="absolute left-0 top-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-[10px] md:text-xs z-10">
                      {idx + 1}
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <div className="sticky top-20 md:top-24 bg-dark py-2 z-10">
                         <h3 className="text-xs md:text-lg font-bold text-white/40 uppercase tracking-widest">{date}</h3>
                      </div>
                      <div className="grid gap-3 md:gap-4">
                        {activities.map((activity: any) => (
                          <Swipeable key={activity.id} onDelete={() => console.log('Delete', activity.id)}>
                            <Card className="border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group p-4 md:p-6">
                              <div className="flex items-start md:items-center gap-4 md:gap-6">
                                <div className="text-center w-12 md:w-20 flex-shrink-0">
                                  <p className="text-sm md:text-xl font-bold text-white">{activity.startTime || '--:--'}</p>
                                  <p className="text-[9px] md:text-[10px] text-white/30 uppercase font-bold">{activity.duration || 60}m</p>
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-base md:text-lg font-bold text-white truncate">{activity.title}</h4>
                                    <div className="flex gap-1 md:gap-2">
                                      <button className="p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5"><Edit3 size={14} className="md:size-16" /></button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-xs text-white/40">
                                    <span className="flex items-center gap-1.5"><Navigation size={12} className="text-primary md:size-14" /> {activity.location}</span>
                                    <span className="flex items-center gap-1.5"><DollarSign size={12} className="text-green-400 md:size-14" /> ${activity.cost}</span>
                                    <Badge variant="secondary" className="px-2 py-0 h-5 text-[9px]">{activity.category}</Badge>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Swipeable>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[32px] text-white/20">
                  Your itinerary is empty. Start adding activities!
                </div>
              )}
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              <Card className="p-6 md:p-8 space-y-6 md:space-y-8">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <PieChartIcon size={20} className="text-primary" /> Category Breakdown
                </h3>
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {budgetData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {budgetData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs md:text-sm text-white/60">{entry.name}: <b className="text-white">${entry.value}</b></span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-4 md:space-y-6">
                <Card className="p-6 bg-premium-gradient">
                  <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest">Remaining Budget</p>
                  <p className="text-3xl md:text-4xl font-bold text-white mt-2">$1,400.00</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[10px] md:text-xs text-white/80">Spent: $600.00</span>
                    <span className="text-[10px] md:text-xs text-white/80 text-right">Limit: $2,000.00</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-white w-[30%]" />
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <h3 className="text-base md:text-lg font-bold text-white">Daily Spending</h3>
                  <div className="h-[180px] md:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{day: 'D1', amt: 200}, {day: 'D2', amt: 150}, {day: 'D3', amt: 250}]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="day" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} />
                        <Bar dataKey="amt" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl md:text-2xl font-bold text-white font-outfit">Travel Notes</h2>
                <Button variant="secondary" size="sm" className="hidden md:flex" icon={<Plus size={16} />}>Add Note</Button>
              </div>
              <div className="grid gap-3 md:gap-4">
                {(trip.notes || []).map((note: any) => (
                  <Swipeable key={note.id} onDelete={() => console.log('Delete note', note.id)}>
                    <Card className="p-4 md:p-6 bg-white/5 border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest">{new Date(note.createdAt).toLocaleString()}</span>
                        <div className="flex gap-2">
                          <button className="p-1 text-white/20 hover:text-white"><Edit3 size={14} /></button>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-white/70 leading-relaxed">{note.content}</p>
                    </Card>
                  </Swipeable>
                ))}
                {(trip.notes || []).length === 0 && (
                  <div className="p-12 text-center text-white/20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                    No notes yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="What do you need to pack?" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-primary transition-all"
                />
                <Button icon={<Plus size={20} />}>Add Item</Button>
              </div>

              <Card className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-xl font-bold text-white">Essentials</h3>
                  <span className="text-xs text-white/40">2 of 5 packed</span>
                </div>
                <div className="space-y-3">
                  {['Passport & Visas', 'Flight Tickets', 'Travel Insurance', 'Emergency Cash', 'Power Bank'].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-3">
                        {i < 2 ? <CheckCircle2 className="text-primary" size={24} /> : <Circle className="text-white/20 group-hover:text-white/40" size={24} />}
                        <span className={`text-sm ${i < 2 ? 'text-white/40 line-through' : 'text-white'}`}>{item}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-dark-lighter/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-40">
        <Button variant="ghost" size="sm" className="w-12 h-12 rounded-2xl hover:bg-primary/20 hover:text-primary"><Share2 size={20} /></Button>
        <div className="w-[1px] h-6 bg-white/10" />
        <Button variant="ghost" size="sm" className="w-12 h-12 rounded-2xl hover:bg-primary/20 hover:text-primary"><FileDown size={20} /></Button>
        <div className="w-[1px] h-6 bg-white/10" />
        <Button variant="ghost" size="sm" className="w-12 h-12 rounded-2xl hover:bg-red-500/20 hover:text-red-400"><Trash2 size={20} /></Button>
      </div>
    </div>
  );
};

export default TripDetail;
