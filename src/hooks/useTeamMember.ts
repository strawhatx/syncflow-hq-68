import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { teamService } from '@/services/team/service';

export interface TeamMemberData {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'member';
  status: 'active' | 'invited';
}

export function useTeamMember() {
  const { user } = useAuth();
  const [teamMember, setTeamMember] = useState<TeamMemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTeamMember() {
      if (!user) {
        setTeamMember(null);
        setIsLoading(false);
        return;
      }

      try {
        const userTeamData = await teamService.getTeamMembersByUser(user.id);
        
        if (!userTeamData.team_members || userTeamData.team_members.length === 0) {
          setTeamMember(null);
          setIsLoading(false);
          return;
        }

        const member = userTeamData.team_members[0];
        setTeamMember({
          id: member.id,
          team_id: member.team_id,
          user_id: member.user_id,
          role: member.role,
          status: member.status
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch team member data'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamMember();
  }, [user]);

  return { teamMember, isLoading, error };
}