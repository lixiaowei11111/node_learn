import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { formatFileSize } from '@/lib/formatters';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  isMobile?: boolean;
}

export function FileUpload({
  selectedFile,
  onFileSelect,
  isMobile = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          文件选择
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={handleClick}
            variant="outline"
            className={`border-dashed border-2 w-full ${
              isMobile ? 'h-20' : 'h-32'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              <span>选择文件</span>
            </div>
          </Button>
          {selectedFile && (
            <div
              className={`rounded-lg ${isMobile ? 'p-3 bg-muted' : 'p-4 bg-muted'}`}
            >
              <div className="space-y-2">
                <p className="font-medium">已选择文件：</p>
                <p
                  className={`text-muted-foreground ${isMobile ? 'text-sm break-all' : 'text-sm'}`}
                >
                  {isMobile ? selectedFile.name : `名称：${selectedFile.name}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isMobile
                    ? formatFileSize(selectedFile.size)
                    : `大小：${formatFileSize(selectedFile.size)}`}
                </p>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    类型：{selectedFile.type || '未知'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
