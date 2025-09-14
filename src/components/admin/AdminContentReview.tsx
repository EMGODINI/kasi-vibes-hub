import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PendingPost {
  id: number;
  user: string;
  content: string;
  category: string;
  type: string;
}

const AdminContentReview = () => {
  const pendingPosts: PendingPost[] = [
    { id: 1, user: 'NewUser123', content: 'Check out my new ride!', category: 'Die Stance', type: 'Photo' },
    { id: 2, user: 'MusicLover', content: 'Fresh beat for the streets', category: 'Styla Samahala', type: 'Audio' },
    { id: 3, user: 'DanceKing', content: 'New dance challenge!', category: 'Umdantso Kuphela', type: 'Video' },
  ];

  const handleApprove = (postId: number) => {
    console.log('Approved post:', postId);
    // TODO: Implement approval logic
  };

  const handleReject = (postId: number) => {
    console.log('Rejected post:', postId);
    // TODO: Implement rejection logic
  };

  return (
    <Card className="clean-card">
      <CardHeader>
        <CardTitle>Pending Content Review</CardTitle>
        <CardDescription>Review and approve user submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/70">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{post.user}</span>
                  <Badge variant="outline">{post.category}</Badge>
                  <Badge variant="secondary">{post.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{post.content}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="gradient"
                  onClick={() => handleApprove(post.id)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleReject(post.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminContentReview;