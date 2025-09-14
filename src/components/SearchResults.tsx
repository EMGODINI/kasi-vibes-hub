import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultsProps {
  results: { type: string; data: any }[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <Card className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30 mb-6">
        <CardContent className="p-4 text-center text-gray-400">
          No results found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <Card key={index} className="backdrop-blur-md bg-gray-900/70 border border-orange-500/30">
          <CardContent className="p-4">
            {result.type === 'profile' && (
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={result.data.avatar_url || '/placeholder.svg'} />
                  <AvatarFallback>{result.data.username ? result.data.username[0].toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-white">{result.data.username}</h3>
                  <p className="text-gray-400">Profile</p>
                </div>
                <Link to={`/profile/${result.data.id}`} className="ml-auto text-orange-400 hover:underline">
                  View Profile
                </Link>
              </div>
            )}

            {result.type === 'post' && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={result.data.profiles?.avatar_url || '/placeholder.svg'} />
                    <AvatarFallback>{result.data.profiles?.username ? result.data.profiles.username[0].toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold text-sm">{result.data.profiles?.username || 'Unknown User'}</p>
                    <p className="text-gray-400 text-xs">
                      {formatDistanceToNow(new Date(result.data.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <p className="text-white text-sm mb-2">{result.data.content}</p>
                {result.data.image_url && (
                  <img src={result.data.image_url} alt="Post" className="w-full h-32 object-cover rounded-md mb-2" />
                )}
                {result.data.video_url && (
                  <video controls src={result.data.video_url} className="w-full h-32 object-cover rounded-md mb-2" />
                )}
                {result.data.external_link && (
                  <a href={result.data.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm block">
                    {result.data.external_link}
                  </a>
                )}
                <Link to={`/post/${result.data.id}`} className="mt-2 text-orange-400 hover:underline text-sm block">
                  View Post
                </Link>
              </div>
            )}

            {result.type === 'page' && (
              <div className="flex items-center space-x-4">
                {result.data.icon_url ? (
                  <img src={result.data.icon_url} alt={result.data.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                    {result.data.name[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{result.data.name}</h3>
                  <p className="text-gray-400">Community Page</p>
                </div>
                <Link to={`/page/${result.data.slug}`} className="ml-auto text-orange-400 hover:underline">
                  Visit Page
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;


