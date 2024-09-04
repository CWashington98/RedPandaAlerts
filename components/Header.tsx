import Link from "next/link";

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link
        href="/"
        className="flex items-center justify-center"
        prefetch={false}
      >
        <BarChartIcon className="h-6 w-6" />
        <span className="sr-only">Stock Price Alerts</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          href="#"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          How it Works
        </Link>
        <Link
          href="#"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Pricing
        </Link>
        <Link
          href="#"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Contact
        </Link>
        <Link
          href="/sign-up"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Login
        </Link>
      </nav>
    </header>
  );
}

function BarChartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}