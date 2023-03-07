import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';

export default function TwoFactor() {
  return (
    <div>
      <NavBar account />
      <SideBar>
        <SideBarRow type="link" url="/account">
          Account
        </SideBarRow>
        <SideBarRow type="link" url="/account/api">
          API Keys
        </SideBarRow>
        <SideBarRow selected type="link" url="#">
          Two Factor
        </SideBarRow>
      </SideBar>
      This page is work in progress!
    </div>
  );
}
