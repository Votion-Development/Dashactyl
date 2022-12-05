import { BsPlugFill } from 'react-icons/bs';
import { RemoteServer } from '~/models/remote.server';

export default function ServerRow({ id, name, status }: RemoteServer) {
  const getColor = () => {
    switch (status) {
      case 'suspended':
        return 'text-red-600';
      case 'transferring':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  }

  return (
    <li className="max-w-md mr-1 my-3 bg-slate-800 text-white rounded-md" key={id}>
      <div className="flex p-3 text-white text-xl font-medium">
        <BsPlugFill className={`mt-1 mr-3 ${getColor()}`} />
        {name}
      </div>
    </li>
  );
}
