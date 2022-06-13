export default (event) => {
    event.preventDefault();
    return new Promise((resolve, reject) => {
        fetch(`/api/admin/location/update/status`,
            {
                body: JSON.stringify({
                    location: event.target.location.value,
                    status: event.target.status.value,
                }),
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            }).then(res => resolve(res.json())).catch(reject);
    });
}