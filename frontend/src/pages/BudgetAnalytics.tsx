import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3, 
  LineChart as LineChartIcon,
  Filter,
  Download,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from 'recharts';
import { tripService } from '../services/tripService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const BudgetAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips();
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = trips.reduce((acc, trip) => acc + (trip.totalBudget || 0), 0);
  const avgCost = trips.length > 0 ? totalBudget / trips.length : 0;
  const mostExpensive = [...trips].sort((a, b) => (b.totalBudget || 0) - (a.totalBudget || 0))[0];

  const categoryData = [
    { name: 'Sightseeing', value: 4500 },
    { name: 'Food', value: 3200 },
    { name: 'Transport', value: 2800 },
    { name: 'Accommodation', value: 6500 },
    { name: 'Shopping', value: 1500 },
    { name: 'Other', value: 900 },
  ];

  const tripSpendingData = trips.slice(0, 6).map(trip => ({
    name: trip.name.length > 10 ? trip.name.substring(0, 10) + '...' : trip.name,
    budget: trip.totalBudget || 0,
    spent: (trip.totalBudget || 0) * 0.8 // Mock spent for now
  }));

  const trendData = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 2100 },
    { month: 'Mar', amount: 1800 },
    { month: 'Apr', amount: 3400 },
    { month: 'May', amount: 2800 },
    { month: 'Jun', amount: 4200 },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return <div className="p-20 text-center text-white/40">Analyzing your spending...</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-outfit">Budget Analytics</h1>
          <p className="text-sm text-white/40 mt-1">Detailed insights into your travel spending patterns.</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="secondary" size="sm" className="flex-1 md:flex-none" icon={<Filter size={16} />}>Filters</Button>
          <Button size="sm" className="flex-1 md:flex-none" icon={<Download size={16} />}>Export</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, trend: '+12.5%', icon: DollarSign, color: 'primary' },
          { label: 'Avg Trip Cost', value: `$${avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, trend: '-4.2%', icon: TrendingUp, color: 'accent' },
          { label: 'Most Expensive', value: mostExpensive?.name || 'N/A', sub: `$${mostExpensive?.totalBudget.toLocaleString() || 0}`, icon: BarChart3, color: 'secondary' },
          { label: 'Upcoming Budgets', value: '$4,250', trend: '+18%', icon: PieChartIcon, color: 'primary' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} initial="hidden" animate="show" transition={{ delay: i * 0.1 }}>
            <Card className="p-6 border-white/5 bg-white/5 group hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl bg-${stat.color}/20 text-${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                {stat.trend && (
                  <span className={`text-xs font-bold flex items-center gap-1 ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
                  </span>
                )}
              </div>
              <div className="mt-6 space-y-1">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.sub && <p className="text-xs text-white/30">{stat.sub}</p>}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <Card className="lg:col-span-1 p-6 md:p-8 space-y-6 md:space-y-8">
          <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <PieChartIcon size={20} className="text-primary" /> Spending by Category
          </h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-white/60 group-hover:text-white transition-colors">{cat.name}</span>
                </div>
                <span className="text-xs font-bold text-white">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Trip Comparison & Trend */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 md:p-8 space-y-6 md:space-y-8">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-secondary" /> Budget vs Spent
            </h3>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tripSpendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Bar dataKey="budget" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="spent" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-6 md:space-y-8">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <LineChartIcon size={20} className="text-accent" /> Monthly Trend
            </h3>
            <div className="h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#ec4899" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#ec4899', strokeWidth: 2, stroke: '#0f172a' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Trip Breakdown Table */}
      <Card className="overflow-hidden border-white/5 bg-white/5">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Trip Breakdown</h3>
          <Button variant="ghost" size="sm">View All History</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                <th className="px-8 py-4">Trip Name</th>
                <th className="px-8 py-4">Date Range</th>
                <th className="px-8 py-4">Total Budget</th>
                <th className="px-8 py-4">Spent</th>
                <th className="px-8 py-4">Remaining</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trips.slice(0, 5).map((trip) => (
                <tr key={trip.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{trip.name}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-white/50">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-white">${trip.totalBudget.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-red-400">${(trip.totalBudget * 0.8).toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-green-400">${(trip.totalBudget * 0.2).toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <Badge variant={new Date(trip.startDate) >= new Date() ? 'primary' : 'secondary'}>
                      {new Date(trip.startDate) >= new Date() ? 'Upcoming' : 'Past'}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BudgetAnalytics;
