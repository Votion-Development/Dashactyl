import React from "react";

// components

import CardStats from "../Cards/CardStats";

export default function HeaderStats() {
  const [isLoading, setIsLoading] = React.useState("block");
  const [showText, setShowText] = React.useState("none")
  const [ram, setRam] = React.useState(String)
  const [cpu, setCPU] = React.useState(String)
  const [disk, setDisk] = React.useState(String)
  const [servers, setServers] = React.useState(String)

  React.useEffect(() => {
    fetch('http://personal1.jmgcoding.com:3003/api/me', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(json => {
        setRam(`${json.stats.used_ram}MB/${json.stats.total_ram}MB`)
        setCPU(`${json.stats.used_cpu}%/${json.stats.total_cpu}%`)
        setDisk(`${json.stats.used_disk}MB/${json.stats.total_disk}MB`)
        setServers(`${json.servers.length}`)
        setIsLoading("none")
        setShowText("block")
      })
  }, []);

  return (
    <>
      {/* Header */}
      <div className="relative bg-lightBlue-600 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="Ram"
                  statTitle={ram}
                  isLoading={isLoading}
                  showText={showText}
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="CPU"
                  statTitle={cpu}
                  isLoading={isLoading}
                  showText={showText}
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="Disk"
                  statTitle={disk}
                  isLoading={isLoading}
                  showText={showText}
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="Servers"
                  statTitle={servers}
                  isLoading={isLoading}
                  showText={showText}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
