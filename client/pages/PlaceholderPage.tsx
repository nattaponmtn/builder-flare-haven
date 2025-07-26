import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  features?: string[];
}

export function PlaceholderPage({ title, description, features = [] }: PlaceholderPageProps) {
  return (
    <div className="p-4 pb-20 md:pb-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            This feature is currently under development. We're working hard to bring you an amazing experience.
          </p>
          
          {features.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Planned Features:</h3>
              <div className="grid gap-2 text-sm text-muted-foreground">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline">
              Request Feature Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
