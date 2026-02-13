import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity,
  Calendar,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { timelineApi } from '../services/api';
import type { LabTrend } from '../types';
import { formatDate } from '../utils/formatters';

const COMMON_LABS = [
  { code: '4548-4', name: 'HbA1c', unit: '%', normalRange: '4.0-5.6' },
  { code: '1558-6', name: 'Fasting Glucose', unit: 'mg/dL', normalRange: '70-100' },
  { code: '2093-3', name: 'Total Cholesterol', unit: 'mg/dL', normalRange: '<200' },
  { code: '2085-9', name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '>40' },
  { code: '2571-8', name: 'Triglycerides', unit: 'mg/dL', normalRange: '<150' },
  { code: '33717-0', name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: '<100' },
  { code: '2951-2', name: 'Sodium', unit: 'mmol/L', normalRange: '136-145' },
  { code: '2823-3', name: 'Potassium', unit: 'mmol/L', normalRange: '3.5-5.0' },
  { code: '2160-0', name: 'Creatinine', unit: 'mg/dL', normalRange: '0.7-1.3' },
];

export const LabTrends = () => {
  const [selectedLab, setSelectedLab] = useState(COMMON_LABS[0]);
  const [trendData, setTrendData] = useState<LabTrend | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadTrendData();
  }, [selectedLab]);
  
  const loadTrendData = async () => {
    try {
      setLoading(true);
      const response = await timelineApi.getLabTrend(selectedLab.code);
      setTrendData(response.data);
    } catch (err) {
      console.error('Failed to load trend data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getTrendIcon = () => {
    if (!trendData) return null;
    switch (trendData.trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-gray-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getTrendColor = () => {
    if (!trendData) return '#9CA3AF';
    switch (trendData.trend) {
      case 'increasing':
        return '#EF4444';
      case 'decreasing':
        return '#10B981';
      case 'stable':
        return '#6B7280';
      default:
        return '#9CA3AF';
    }
  };
  
  const chartData = trendData?.data_points.map(dp => ({
    date: formatDate(dp.date, 'MMM d'),
    fullDate: formatDate(dp.date),
    value: dp.value
  })) || [];
  
  return (
    <div className="space-y-6">
      {/* Lab Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Lab Test</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_LABS.map(lab => (
            <button
              key={lab.code}
              onClick={() => setSelectedLab(lab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLab.code === lab.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lab.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Value Card */}
      {trendData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{trendData.name}</h2>
              <p className="text-sm text-gray-500">Latest result from {formatDate(trendData.latest_date)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-4xl font-bold text-gray-900">{trendData.latest_value}</span>
                <span className="text-lg text-gray-500">{trendData.unit}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 justify-end">
                {getTrendIcon()}
                <span className="text-sm text-gray-600 capitalize">{trendData.trend.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>Reference range: {selectedLab.normalRange} {trendData.unit}</span>
          </div>
        </motion.div>
      )}
      
      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Over Time</h3>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : chartData.length > 1 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 500 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getTrendColor()}
                  strokeWidth={3}
                  dot={{ fill: getTrendColor(), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <Calendar className="w-12 h-12 mb-2" />
            <p>Insufficient data for trend analysis</p>
            <p className="text-sm">At least 2 data points are needed</p>
          </div>
        )}
      </div>
      
      {/* Data Table */}
      {trendData && trendData.data_points.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...trendData.data_points].reverse().map((point, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(point.date)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {point.value} {trendData.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
