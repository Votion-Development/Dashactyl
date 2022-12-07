import { Link } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';

export default function API() {
  return (
    <div>
      <NavBar account />
      <SideBar>
        <SideBarRow>
          <Link to="/account">Account</Link>
        </SideBarRow>
        <SideBarRow selected>
          <Link to="#">API Keys</Link>
        </SideBarRow>
      </SideBar>
    </div>
  );
}
