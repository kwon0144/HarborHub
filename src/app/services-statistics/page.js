'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function ServicesStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [statisticsData, setStatisticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('meditations');

  const fetchStatisticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/statistics');
      if (response.ok) {
        const result = await response.json();
        setStatisticsData(result.data);
      } else {
        console.error('Failed to fetch statistics data');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatisticsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26435D] mx-auto mb-4"></div>
          <div className="text-[#26435D] text-2xl font-bold">Loading....</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#26435D] py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Services Statistics
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="service-statistics py-12">
        <div className="container mx-auto px-4">
          {/* Title */}
          <div className="flex justify-between items-center flex-wrap mb-8">
            <h2 className="text-2xl font-bold text-[#26435D] mb-4 md:mb-0">
              Engagement and Usage Metrics for Resources and Activities
            </h2>
          </div>

          {/* Charts Row 1 - Resource Ratings and Enrollment Trends */}
          <div className="flex flex-wrap gap-6 mb-8">
            {/* Resource Ratings Chart */}
            <div className="flex-1 min-w-[500px] h-[500px] border-2 border-black rounded-lg bg-white">
              <div className="text-xl font-bold p-6 pb-4 text-[#26435D]">
                Resource Ratings Table
              </div>
              <div className="w-full h-[420px] px-4 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statisticsData?.resourceRatings || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="title" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 5]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #1E88E5',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value, name, props) => [
                        `Average Rating: ${value}`,
                        `Total Ratings: ${props.payload.totalRatings}`
                      ]}
                    />
                    <Bar 
                      dataKey="avgRating" 
                      fill="#42A5F5" 
                      stroke="#1E88E5"
                      strokeWidth={1}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Enrollment Trends Chart */}
            <div className="flex-1 min-w-[500px] h-[500px] border-2 border-black rounded-lg bg-white">
              <div className="text-xl font-bold p-6 pb-4 text-[#26435D]">
                Activities Enrollment Trend
              </div>
              <div className="w-full h-[420px] px-4 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={statisticsData?.enrollmentTrends?.map(item => ({
                      ...item,
                      month: format(parseISO(item.month + '-01'), 'MMM yyyy')
                    })) || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #1E88E5',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                      formatter={(value) => [`${value} Participants`]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="enrollmentCount"
                      stroke="#1E88E5"
                      strokeWidth={3}
                      fill="rgba(30, 136, 229, 0.2)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-center mb-6">
              <div className="bg-[#E0EDF9] p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-[#26435D]">
                  Comments from Users on Online Resources
                </h3>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {['meditations', 'exercises', 'techniques'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                      activeTab === tab
                        ? 'border-[#26435D] text-[#26435D]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="h-96 overflow-y-auto">
              {statisticsData && statisticsData.commentsByType && (
                <div className="space-y-4">
                  {statisticsData.commentsByType[activeTab]?.map((comment, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4">
                      <p className="text-gray-700">{comment}</p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-8">
                      No comments available for {activeTab}.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
