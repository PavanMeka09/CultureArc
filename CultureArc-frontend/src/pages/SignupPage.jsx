import React from 'react';
import SignupWizard from '../components/auth/SignupWizard';

const SignupPage = () => {
    return (
        <div className="flex flex-col flex-1 items-center justify-center p-4">
            <SignupWizard />
        </div>
    );
};

export default SignupPage;
