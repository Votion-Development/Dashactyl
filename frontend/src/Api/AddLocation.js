export default (event) => {
    event.preventDefault();
    return new Promise((resolve, reject) => {
        fetch(`http://personal1.jmgcoding.com:3003/api/admin/addLocation`,
            {
                body: JSON.stringify({
                    name: event.target.location_name.value,
                    location_id: event.target.location_id.value,
                    location_enabled: event.target.location_enabled.value,
                }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            }).then(res => resolve(res.json())).catch(reject);
    });
}