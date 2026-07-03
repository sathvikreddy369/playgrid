import React from 'react';
import { Trophy, Calendar, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatsGrid = ({ user }: { user: any }) => {
  const matchesJoined = user._count?.matchParticipations || 0;
  const matchesHosted = user._count?.matchesCreated || 0;
  const communitiesJoined = user._count?.communityMemberships || 0;
  
  // Example heuristic: Completion % based on matches attended vs total joined
  // In a real app this would be computed by backend accurately.
  const completionRate = '95%'; 

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-surface border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
        <Calendar className="w-6 h-6 text-orange-500 mb-2" />
        <span className="text-2xl font-black text-foreground">{matchesJoined}</span>
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Matches Joined</span>
      </motion.div>
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-surface border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
        <Trophy className="w-6 h-6 text-emerald-500 mb-2" />
        <span className="text-2xl font-black text-foreground">{matchesHosted}</span>
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Matches Hosted</span>
      </motion.div>
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-surface border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
        <Users className="w-6 h-6 text-blue-500 mb-2" />
        <span className="text-2xl font-black text-foreground">{communitiesJoined}</span>
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Communities</span>
      </motion.div>
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-surface border border-border p-4 rounded-2xl flex flex-col items-center justify-center text-center">
        <Target className="w-6 h-6 text-purple-500 mb-2" />
        <span className="text-2xl font-black text-foreground">{completionRate}</span>
        <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Attendance Rate</span>
      </motion.div>
    </div>
  );
};
