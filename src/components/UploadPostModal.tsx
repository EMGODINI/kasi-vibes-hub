
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Video, Upload, X, MapPin, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageType: 'stance' | 'stoko' | 'general';
}

const UploadPostModal = ({ isOpen, onClose, pageType }: UploadPostModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const stanceTags = [
    'BMW', 'VW', 'Toyota', 'Audi', 'Honda', 'Opel', 'Ford',
    'E30', 'E36', 'Golf', 'Polo', 'Corolla', 'Tazz',
    'Wraps', 'Paint', 'Spinners', 'LowLife', 'Stance',
    'Mods', 'Custom', 'Clean', 'Fresh'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    if (!selectedFile || !caption.trim()) {
      toast({
        title: "Missing information",
        description: "Please add a photo and caption",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "🔥 Posted successfully!",
        description: "Your whip is now live on Die Stance",
      });

      // Reset form
      setSelectedFile(null);
      setPreview('');
      setCaption('');
      setLocation('');
      setSelectedTags([]);
      setCarMake('');
      setCarModel('');
      onClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-orange-500" />
            <span>Drop Your Whip</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Photo/Video
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                Max size: 10MB
              </p>
            </div>
          ) : (
            <div className="relative">
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <video 
                  src={preview} 
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
              )}
              <Button
                onClick={removeFile}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Car Details */}
          {pageType === 'stance' && (
            <div className="grid grid-cols-2 gap-3">
              <Select value={carMake} onValueChange={setCarMake}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Car Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bmw">BMW</SelectItem>
                  <SelectItem value="vw">Volkswagen</SelectItem>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="audi">Audi</SelectItem>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="opel">Opel</SelectItem>
                  <SelectItem value="ford">Ford</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Model (e.g., E30, Golf)"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
          )}

          {/* Caption */}
          <Textarea
            placeholder="Tell us about your whip..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-gray-800 border-gray-600 min-h-[80px]"
            maxLength={500}
          />

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Location (e.g., Soweto, Alex)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-gray-800 border-gray-600 pl-10"
            />
          </div>

          {/* Tags */}
          {pageType === 'stance' && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {stanceTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer text-xs ${
                      selectedTags.includes(tag)
                        ? 'bg-orange-600 text-white'
                        : 'border-gray-600 text-gray-300 hover:border-orange-500'
                    }`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !caption.trim() || isUploading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isUploading ? "Posting..." : "Drop Your Whip 🔥"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPostModal;
