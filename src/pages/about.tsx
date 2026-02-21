import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="col-full-center min-h-screen text-3xl font-semibold capitalize">
      <p>about us</p>
      <p>coming soon...</p>
      <Link to="/" className="mt-5">
        Go Home
      </Link>
    </div>
  );
}
