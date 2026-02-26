import { Link } from 'react-router-dom';
import { CommandBar } from './custom/CommandBar';

export default function Navbar() {
  return (
    <nav className="flex bg-black px-6 py-3 text-white md:px-12">
      <div className="align-center gap-3">
        <img src="/logo.png" width={40} alt="swagster logo" />
        <div className="col">
          <Link to={'/'} className="text-lg font-medium text-white!">
            Swagster
          </Link>
          <span className="text-xs">By Steeve</span>
        </div>
      </div>

      <div className="just-end w-full items-center">
        <CommandBar />
      </div>
    </nav>
  );
}
