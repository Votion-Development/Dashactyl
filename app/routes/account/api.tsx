import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';

export default function API() {
  return (
    <div>
      <NavBar account />
      <SideBar>
        <SideBarRow type="link" url="/account">
          Account
        </SideBarRow>
        <SideBarRow selected type="link" url="#">
          API Keys
        </SideBarRow>
      </SideBar>
    </div>
  );
}
