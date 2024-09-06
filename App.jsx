import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const generateUSData = (federalRate, corporateRate, capitalGainsRate) => {
  const data = [];
  let baseRevenue = 3.5; // Trillion USD
  let baseGrowth = 2.5; // Percentage
  let baseCompliance = 83; // Percentage
  let baseMobility = 50; // Index

  for (let year = 2023; year <= 2033; year++) {
    const federalImpact = 1 + (federalRate - 0.25) * 0.5;
    const corporateImpact = 1 + (corporateRate - 0.21) * 0.3;
    const capitalGainsImpact = 1 + (capitalGainsRate - 0.15) * 0.2;

    const combinedImpact = (federalImpact + corporateImpact + capitalGainsImpact) / 3;
    
    const revenue = baseRevenue * combinedImpact * (1 + (Math.random() - 0.5) * 0.1);
    const growth = baseGrowth * (2 - combinedImpact) * (1 + (Math.random() - 0.5) * 0.2);
    const compliance = baseCompliance * (2 - combinedImpact) * (1 + (Math.random() - 0.5) * 0.05);
    const mobility = baseMobility * (2 - combinedImpact) * (1 + (Math.random() - 0.5) * 0.1);

    data.push({ year, revenue, growth, compliance, mobility });

    // Adjust base values for next year
    baseRevenue *= 1.02;
    baseGrowth *= 0.99;
    baseCompliance *= 1.005;
    baseMobility *= 1.01;
  }
  return data;
};

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPercentage = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const MetricCard = ({ title, value, unit, trend }) => (
  <div className="bg-white rounded-lg shadow-md p-4 h-full">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-2xl font-bold">
      {unit === '$' ? formatCurrency.format(value) : unit === '%' ? formatPercentage.format(value / 100) : value.toFixed(2)}
      {unit !== '$' && unit !== '%' ? ` ${unit}` : ''}
    </p>
    <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}%
    </p>
  </div>
);

const Dashboard = () => {
  const [federalRate, setFederalRate] = useState(0.25);
  const [corporateRate, setCorporateRate] = useState(0.21);
  const [capitalGainsRate, setCapitalGainsRate] = useState(0.15);

  const data = generateUSData(federalRate, corporateRate, capitalGainsRate);
  const currentMetrics = data[0];

  const handleOptimize = useCallback(() => {
    setFederalRate(0.28);
    setCorporateRate(0.23);
    setCapitalGainsRate(0.18);
  }, []);

  const calculateTrend = useCallback((metric) => {
    if (data.length < 2) return 0;
    const currentValue = data[0][metric];
    const prevValue = data[1][metric];
    return ((currentValue - prevValue) / prevValue) * 100;
  }, [data]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">US Tax Policy and Economic Impact Simulator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Federal Income Tax Rate: {(federalRate * 100).toFixed(1)}%</h2>
          <input
            type="range"
            min="10"
            max="40"
            step="0.1"
            value={federalRate * 100}
            onChange={(e) => setFederalRate(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Corporate Tax Rate: {(corporateRate * 100).toFixed(1)}%</h2>
          <input
            type="range"
            min="15"
            max="35"
            step="0.1"
            value={corporateRate * 100}
            onChange={(e) => setCorporateRate(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Capital Gains Tax Rate: {(capitalGainsRate * 100).toFixed(1)}%</h2>
          <input
            type="range"
            min="0"
            max="30"
            step="0.1"
            value={capitalGainsRate * 100}
            onChange={(e) => setCapitalGainsRate(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>
      </div>

      <button 
        onClick={handleOptimize}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
      >
        Find Optimal Tax Rates
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Government Revenue" 
          value={currentMetrics.revenue || 0}
          unit="$"
          trend={calculateTrend('revenue')}
        />
        <MetricCard 
          title="Economic Growth" 
          value={currentMetrics.growth || 0}
          unit="%"
          trend={calculateTrend('growth')}
        />
        <MetricCard 
          title="Tax Compliance" 
          value={currentMetrics.compliance || 0}
          unit="%"
          trend={calculateTrend('compliance')}
        />
        <MetricCard 
          title="Economic Mobility Index" 
          value={currentMetrics.mobility || 0}
          unit=""
          trend={calculateTrend('mobility')}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">10-Year Economic Projections</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency.format(value) :
                name === 'growth' || name === 'compliance' ? formatPercentage.format(value / 100) :
                value.toFixed(2),
                name
              ]}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Government Revenue (Trillion USD)" />
            <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#82ca9d" name="Economic Growth (%)" />
            <Line yAxisId="right" type="monotone" dataKey="compliance" stroke="#ffc658" name="Tax Compliance (%)" />
            <Line yAxisId="right" type="monotone" dataKey="mobility" stroke="#ff7300" name="Economic Mobility Index" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Tax Rate Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            {name: 'Federal Income', rate: federalRate},
            {name: 'Corporate', rate: corporateRate},
            {name: 'Capital Gains', rate: capitalGainsRate}
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
            <Bar dataKey="rate" fill="#8884d8" />
          </BarChart>
        </ResponsiveVariable>
      </div>

      <p className="mb-4">
        This interactive dashboard simulates the complex relationships between various US tax rates and key economic indicators. Adjust the tax rate sliders to see how different policies might affect government revenue, economic growth, tax compliance, and economic mobility over a 10-year period. The "Find Optimal Tax Rates" button suggests rates that may maximize overall economic benefit based on our simplified model.
      </p>

      <p className="text-sm text-gray-600">
        Note: This simulation uses simplified models and hypothetical data. Real-world economic systems are far more complex and influenced by numerous factors beyond tax rates. For accurate and up-to-date information on US tax policies and economic data, please refer to official sources such as the IRS (www.irs.gov), the US Treasury (www.treasury.gov), and the Bureau of Economic Analysis (www.bea.gov).
      </p>
    </div>
  );
};

export default Dashboard;
