
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Music, GlassWater, ShieldAlert } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export const UserSelector: React.FC = () => {
  const { users, setCurrentUser, createNewPatron } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [username, setUsername] = useState('');

  const staffUsers = users.filter(user => user.role !== 'patron');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'dj':
        return <Music className="h-5 w-5 text-club-blue" />;
      case 'bartender':
        return <GlassWater className="h-5 w-5 text-club-green" />;
      case 'security':
        return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
      default:
        return <User className="h-5 w-5 text-club-pink" />;
    }
  };

  const handlePatronClick = () => {
    setIsDialogOpen(true);
  };

  const handleCreatePatron = () => {
    if (username.trim().length > 0) {
      createNewPatron(username);
      setIsDialogOpen(false);
      setUsername('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-center text-3xl neon-text">
            Select Your Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-club-pink">Patron</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                className="justify-start bg-white/5 hover:bg-white/10 hover:text-club-pink"
                onClick={handlePatronClick}
              >
                <User className="h-5 w-5 mr-2 text-club-pink" />
                Enter as a Patron
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-club-blue">Staff</h3>
            <div className="grid grid-cols-1 gap-2">
              {staffUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="outline"
                  className="justify-start bg-white/5 hover:bg-white/10"
                  onClick={() => setCurrentUser(user)}
                >
                  {getRoleIcon(user.role)}
                  <span className="ml-2">{user.name}</span>
                  <span className="ml-auto uppercase text-xs bg-white/10 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-center text-xl neon-text">Choose a Username</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="username">Your username</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="mt-2"
              placeholder="Enter your username"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePatron();
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreatePatron} className="w-full bg-club-pink hover:bg-club-pink/80">
              Enter the Club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
