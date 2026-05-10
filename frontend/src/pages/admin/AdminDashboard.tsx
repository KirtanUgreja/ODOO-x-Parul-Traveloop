import React from 'react';
import { 
  Users, 
  Map, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShieldCheck,
  MapPin,
  LogOut
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';



const AdminDashboard: React.FC = () => {
  const userGrowthData = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 210 },
    { month: 'Mar', users: 180 },
    { month: 'Apr', users: 340 },
    { month: 'May', users: 480 },
    { month: 'Jun', users: 620 },
  ];

  const topDestinations = [
    { name: 'Paris, France', count: 45 },
    { name: 'Tokyo, Japan', count: 38 },
    { name: 'Bali, Indonesia', count: 32 },
    { name: 'Rome, Italy', count: 28 },
    { name: 'New York, USA', count: 25 },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white font-outfit">Admin Dashboard</h1>
          <div className="flex items-center gap-2 mt-2 text-primary font-bold text-xs uppercase tracking-widest">
            <ShieldCheck size={14} /> System Administrator
          </div>
        </div>
        <Button variant="secondary" icon={<LogOut size={18} />}>System Logout</Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '1,248', trend: '+24%', icon: Users, color: 'primary' },
          { label: 'Total Trips', value: '3,842', trend: '+12%', icon: Map, color: 'secondary' },
          { label: 'Avg Budget', value: '$2,450', trend: '-2.5%', icon: DollarSign, color: 'accent' },
          { label: 'System Health', value: '99.9%', trend: 'Stable', icon: Activity, color: 'green-500' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-white/5 bg-white/5">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl bg-white/5 text-${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <Badge variant={stat.trend.startsWith('+') ? 'primary' : 'secondary'}>{stat.trend}</Badge>
            </div>
            <div className="mt-6 space-y-1">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 p-8 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> User Registration Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Popular Destinations */}
        <Card className="p-8 space-y-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin size={20} className="text-secondary" /> Top Destinations
          </h3>
          <div className="space-y-6">
            {topDestinations.map((dest, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-white/80">{dest.name}</span>
                  <span className="text-primary font-bold">{dest.count} trips</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(dest.count / 50) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Trips Table */}
      <Card className="overflow-hidden border-white/5 bg-white/5">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Recent Global Activity</h3>
          <Button variant="ghost" size="sm">Download Log</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Trip Details</th>
                <th className="px-8 py-4">Destination</th>
                <th className="px-8 py-4">Created At</th>
                <th className="px-8 py-4">Budget</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { user: 'Alex Rivera', trip: 'European Summer', dest: 'Paris, France', date: '2h ago', budget: '$4,200', status: 'Active' },
                { user: 'Sarah Chen', trip: 'Hokkaido Snow', dest: 'Niseko, Japan', date: '5h ago', budget: '$2,800', status: 'Planning' },
                { user: 'Michael Scott', trip: 'Office Retreat', dest: 'Scranton, USA', date: '1d ago', budget: '$1,200', status: 'Completed' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-premium-gradient flex items-center justify-center text-white font-bold text-[10px]">
                        {row.user[0]}
                      </div>
                      <p className="text-sm font-bold text-white">{row.user}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-white/60">{row.trip}</td>
                  <td className="px-8 py-5 text-sm text-white/60">{row.dest}</td>
                  <td className="px-8 py-5 text-xs text-white/40">{row.date}</td>
                  <td className="px-8 py-5 text-sm font-bold text-white">{row.budget}</td>
                  <td className="px-8 py-5">
                    <Badge variant={row.status === 'Active' ? 'primary' : 'secondary'}>{row.status}</Badge>
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

export default AdminDashboard;
