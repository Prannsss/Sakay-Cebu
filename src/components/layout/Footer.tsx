import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-4 px-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sakay Cebu. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
