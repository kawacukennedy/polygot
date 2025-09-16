
import React from 'react';

interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
}

interface LeaderboardProps {
  title: string;
  data: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ title, data }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-3 uppercase font-semibold text-sm text-left">Rank</th>
              <th className="py-2 px-3 uppercase font-semibold text-sm text-left">Username</th>
              <th className="py-2 px-3 uppercase font-semibold text-sm text-left">XP</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {data.map((entry, index) => (
              <tr key={entry.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-3">{index + 1}</td>
                <td className="py-2 px-3">{entry.username}</td>
                <td className="py-2 px-3">{entry.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
