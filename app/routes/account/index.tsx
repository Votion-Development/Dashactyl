import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';

export default function Account() {
  return (
    <div>
      <NavBar account />
      <SideBar>
        <SideBarRow selected>Account</SideBarRow>
        <SideBarRow>API Keys</SideBarRow>
      </SideBar>
    </div>
  );
}
