
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
}

const Header = ({ title, subtitle, onRefresh }: HeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default Header;
