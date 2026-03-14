import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { SignupForm } from '@/features/auth/components/signup-form';

export default function Page() {
  return (
    <div className="flex w-full items-start justify-center px-6 md:px-10 py-6 md:py-10">
      <div className="w-full max-w-sm mt-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Enter your email below to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
