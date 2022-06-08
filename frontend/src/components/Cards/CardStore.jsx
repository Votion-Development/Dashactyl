import React from "react";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

// components

export default function CardStore() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [ramPrice, setRamPrice] = React.useState(String);
    const [cpuPrice, setCpuPrice] = React.useState(String);
    const [diskPrice, setDiskPrice] = React.useState(String);

    function purchaseRam() {
        const amount = document.getElementById("ram_amount").value;
        fetch(`http://personal1.jmgcoding.com:3003/api/store/purchaseRam/${amount}`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(json => {
                if (json.success) return MySwal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `You have purchased ${amount}MB of Ram!`,
                }).then(() => {
                    return window.location.reload()
                })
                if (json.error) MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: json.error,
                })
            });
    }

    function purchaseCpu() {
        const amount = document.getElementById("cpu_amount").value;
        fetch(`http://personal1.jmgcoding.com:3003/api/store/purchaseCpu/${amount}`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(json => {
                if (json.success) return MySwal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `You have purchased ${amount}% of CPU!`,
                }).then(() => {
                    return window.location.reload()
                })
                if (json.error) MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: json.error,
                })
            });
    }

    function purchaseDisk() {
        const amount = document.getElementById("disk_amount").value;
        fetch(`http://personal1.jmgcoding.com:3003/api/store/purchaseDisk/${amount}`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => response.json())
            .then(json => {
                if (json.success) return MySwal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `You have purchased ${amount}MB of Disk!`,
                }).then(() => {
                    return window.location.reload()
                })
                if (json.error) MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: json.error,
                })
            });
    }

    React.useEffect(() => {
        fetch('http://personal1.jmgcoding.com:3003/api/store', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(json => {
                setRamPrice(json.ram_price)
                setCpuPrice(json.cpu_price)
                setDiskPrice(json.disk_price)
                setIsLoading(false)
            })
    });

    return (
        <>
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                    <div className="flex flex-wrap items-center">
                        <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                            <h3 className="font-semibold text-base text-blueGray-700">
                                Store
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                    <div className="flex flex-wrap items-center">
                        <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                            {isLoading ?
                                <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left">
                                    <div id="loading-button">
                                        <svg role="status" className="w-4 mr-3 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                        </svg>
                                    </div>
                                </th>
                                :
                                <>
                                    <a>1MB Ram Cost: {ramPrice} coins</a>
                                    <br></br>
                                    <br></br>
                                    <div class="relative z-0 w-full mb-6 group">
                                        <input type="text" id="ram_amount" name="ram_amount" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                        <label for="ram_amount" class="peer-focus:font-medium absolute text-sm text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                            amount (e.g 100)
                                        </label>
                                    </div>
                                    <button onClick={purchaseRam} type="button" class="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Purchase</button>
                                    <br></br>
                                    <br></br>
                                    <a>1% CPU Cost: {cpuPrice} coins</a>
                                    <br></br>
                                    <br></br>
                                    <div class="relative z-0 w-full mb-6 group">
                                        <input type="text" id="cpu_amount" name="cpu_amount" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                        <label for="cpu_amount" class="peer-focus:font-medium absolute text-sm text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                            amount (e.g 100)
                                        </label>
                                    </div>
                                    <button onClick={purchaseCpu} type="button" class="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Purchase</button>
                                    <br></br>
                                    <br></br>
                                    <a>1MB Disk Cost: {diskPrice} coins</a>
                                    <br></br>
                                    <br></br>
                                    <div class="relative z-0 w-full mb-6 group">
                                        <input type="text" id="disk_amount" name="disk_amount" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                                        <label for="disk_amount" class="peer-focus:font-medium absolute text-sm text-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                                            amount (e.g 100)
                                        </label>
                                    </div>
                                    <button onClick={purchaseDisk} type="button" class="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Purchase</button>
                                    <br></br>
                                    <br></br>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
