import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-lg font-medium mb-2">页面出错了</p>
          <p className="text-sm text-muted-foreground mb-4">发生了意外错误，请尝试刷新页面</p>
          <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
            重试
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
