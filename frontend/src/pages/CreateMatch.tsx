import React, { useState } from 'react';
import { useCreateMatch } from '../hooks/useMatches';
import { useCommunities } from '../hooks/useCommunities';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';

export const CreateMatch = () => {
 const navigate = useNavigate();
 const createMatch = useCreateMatch();
 
 // To allow linking a match to a community if they manage/belong to one
 // We'll just fetch verified communities for simplicity, though real app would filter by user's communities
 const { data: communities } = useCommunities();

 const [formData, setFormData] = useState({
 title: '',
 sport: '',
 date: '',
 location: '',
 latitude: '',
 longitude: '',
 maxPlayers: 10,
 costPerPerson: '',
 skillLevel: 'ALL',
 matchType: 'CASUAL',
 communityId: ''
 });

 const [mapsLink, setMapsLink] = useState('');

 const handleMapsLinkChange = (e: any) => {
 const link = e.target.value;
 setMapsLink(link);
 
 // Parse Google maps link
 // e.g. https://www.google.com/maps/@17.3966,78.4889,15z
 // or https://maps.google.com/?q=17.3966,78.4889
 const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
 const qRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
 
 const match = link.match(regex) || link.match(qRegex);
 if (match) {
 setFormData(prev => ({
 ...prev,
 latitude: match[1],
 longitude: match[2]
 }));
 }
 };

 const handleChange = (e: any) => {
 setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 const payload = {
 ...formData,
 latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
 longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
 costPerPerson: formData.costPerPerson ? parseFloat(formData.costPerPerson) : undefined
 };

 createMatch.mutate(payload as any, {
 onSuccess: (data: any) => {
 toast.success('Match created successfully');
 navigate(`/matches/${data.id}`);
 },
 onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create match')
 });
 };

 return (
  <div className="max-w-3xl mx-auto py-8 px-4">
  <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-foreground mb-6">
  <ArrowLeft className="w-5 h-5" /> Back
  </Button>

  <div className="bg-surface rounded-2xl shadow-soft border border-border p-8">
  <h1 className="text-3xl font-black text-foreground mb-2">Organize a Game</h1>
  <p className="text-muted text-sm mb-8">Set up a match and let players in your area join you.</p>

  <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="md:col-span-2">
  <Input required label="Match Title *" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Sunday Morning Football 5v5" />
  </div>
  
  <div>
  <Input required label="Sport *" id="sport" name="sport" value={formData.sport} onChange={handleChange} placeholder="e.g. Football" />
  </div>

  <div>
  <Input required label="Date & Time *" id="date" type="datetime-local" name="date" value={formData.date} onChange={handleChange} />
  </div>

  <div className="md:col-span-2">
  <Input required label="Location Name *" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Venue name or address" />
  </div>

  <div className="md:col-span-2 border border-border p-5 rounded-2xl bg-zinc-50/50">
  <Input label="Paste Google Maps Link (Auto-extracts coordinates)" id="mapsLink" type="url" value={mapsLink} onChange={handleMapsLinkChange} placeholder="https://www.google.com/maps/..." />
  
  <div className="grid grid-cols-2 gap-4 mt-4">
  <div>
  <Input label="Latitude" id="latitude" type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="17.3966" />
  </div>
  <div>
  <Input label="Longitude" id="longitude" type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="78.4889" />
  </div>
  </div>
  </div>

  <div>
  <Input required label="Total Spots *" id="maxPlayers" type="number" min="2" max="100" name="maxPlayers" value={formData.maxPlayers} onChange={handleChange} helperText={`Openings available: ${formData.maxPlayers}`} />
  </div>

  <div>
  <Input label="Cost Per Head (₹) - Optional" id="costPerPerson" type="number" min="0" name="costPerPerson" value={formData.costPerPerson} onChange={handleChange} placeholder="e.g. 150" />
  </div>

  <div>
  <Select label="Skill Level" id="skillLevel" name="skillLevel" value={formData.skillLevel} onChange={handleChange}>
  <option value="ALL">All Levels</option>
  <option value="BEGINNER">Beginner</option>
  <option value="INTERMEDIATE">Intermediate</option>
  <option value="ADVANCED">Advanced</option>
  <option value="PRO">Pro</option>
  </Select>
  </div>

  <div>
  <Select label="Match Type" id="matchType" name="matchType" value={formData.matchType} onChange={handleChange}>
  <option value="CASUAL">Casual Play</option>
  <option value="COMPETITIVE">Competitive</option>
  <option value="MEETUP">Community Meetup</option>
  <option value="PRACTICE">Practice Session</option>
  <option value="TRAINING">Training</option>
  <option value="TOURNAMENT">Tournament Match</option>
  </Select>
  </div>

  <div>
  <Select label="Link to Community (Optional)" id="communityId" name="communityId" value={formData.communityId} onChange={handleChange}>
  <option value="">None (Global Match)</option>
  {communities?.map((c: any) => (
  <option key={c.id} value={c.id}>{c.name}</option>
  ))}
  </Select>
  </div>
  </div>

  <div className="pt-6 flex justify-end">
  <Button type="submit" isLoading={createMatch.isPending} className="px-8 rounded-xl font-bold">
  Create Match
  </Button>
  </div>
 </form>
 </div>
 </div>
 );
};
