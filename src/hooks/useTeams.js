import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getTeams();
      const teamsData = response?.data || [];
      setTeams(teamsData);
    } catch (err) {
      setError(err.message || 'Failed to load teams');
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (teamData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.createTeam(teamData);
      const newTeam = response.data || response;
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      setError(err.message || 'Failed to create team');
      console.error('Error creating team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTeam = useCallback(async (teamId, teamData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateTeam(teamId, teamData);
      const updatedTeam = response.data || response;
      setTeams(prev => prev.map(team =>
        team._id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError(err.message || 'Failed to update team');
      console.error('Error updating team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteTeam(teamId);
      setTeams(prev => prev.filter(team => team._id !== teamId));
    } catch (err) {
      setError(err.message || 'Failed to delete team');
      console.error('Error deleting team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (teamId, memberData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.addTeamMember(teamId, memberData);
      const updatedTeam = response.data || response;
      setTeams(prev => prev.map(team =>
        team._id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError(err.message || 'Failed to add member');
      console.error('Error adding member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (teamId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.removeTeamMember(teamId, userId);
      const updatedTeam = response.data || response;
      setTeams(prev => prev.map(team =>
        team._id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError(err.message || 'Failed to remove member');
      console.error('Error removing member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMemberRole = useCallback(async (teamId, userId, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.updateTeamMemberRole(teamId, userId, role);
      const updatedTeam = response.data || response;
      setTeams(prev => prev.map(team =>
        team._id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError(err.message || 'Failed to update member role');
      console.error('Error updating member role:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback(async (teamId, projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.addTeamProject(teamId, projectId);
      const updatedTeam = response.data || response;
      setTeams(prev => prev.map(team =>
        team._id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError(err.message || 'Failed to add project to team');
      console.error('Error adding project to team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeProject = useCallback(async (teamId, projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.removeTeamProject(teamId, projectId);
      const updatedTeam = response.data || response;
      setTeams(prev => prev.map(team =>
        team._id === teamId ? updatedTeam : team
      ));
      return updatedTeam;
    } catch (err) {
      setError(err.message || 'Failed to remove project from team');
      console.error('Error removing project from team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    teams,
    loading,
    error,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    updateMemberRole,
    addProject,
    removeProject,
  };
};
