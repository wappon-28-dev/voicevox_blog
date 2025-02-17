import { Link, graphql, useStaticQuery } from "gatsby"
import React, { useEffect, useState } from "react"
import { APP_VERSION } from "../constants"
import DownloadModalSelecter from "./downloadModalSelecter"

type OsType = "Windows" | "Mac" | "Linux"
type ModeType = "GPU / CPU" | "CPU"
type PackageType = "インストーラー" | "Zip" | "tar.gz"

const modeAvailables: Record<OsType, ModeType[]> = {
  Windows: ["GPU / CPU", "CPU"],
  Mac: ["CPU"],
  Linux: ["GPU / CPU", "CPU"],
}

const packageAvailables: Record<OsType, Record<ModeType, PackageType[]>> = {
  Windows: {
    "GPU / CPU": ["インストーラー", "Zip"],
    CPU: ["インストーラー", "Zip"],
  },
  Mac: {
    "GPU / CPU": ["インストーラー", "Zip"],
    CPU: ["インストーラー", "Zip"],
  },
  Linux: { "GPU / CPU": ["インストーラー"], CPU: ["インストーラー", "tar.gz"] },
}

export const DownloadModal: React.FC<{
  isActive: boolean
  hide: () => void
}> = props => {
  const maintenanceMode = false

  const scriptNodes: { name: string; publicURL: string }[] =
    useStaticQuery(graphql`
      query {
        allFile(filter: { dir: { regex: "/scripts$/" } }) {
          nodes {
            name
            publicURL
          }
        }
      }
    `).allFile.nodes

  const downloadUrls: Record<
    OsType,
    Partial<
      Record<
        ModeType,
        Partial<Record<PackageType, { url: string; name: string }>>
      >
    >
  > = {
    Windows: {
      "GPU / CPU": {
        インストーラー: {
          url: `https://github.com/VOICEVOX/voicevox/releases/download/${APP_VERSION}/VOICEVOX.Web.Setup.${APP_VERSION}.exe`,
          name: `VOICEVOX.Setup.${APP_VERSION}.Windows.exe`,
        },
        Zip: {
          url: `https://github.com/VOICEVOX/voicevox/releases/download/${APP_VERSION}/voicevox-windows-directml-${APP_VERSION}.zip`,
          name: `VOICEVOX.${APP_VERSION}.Windows.zip`,
        },
      },
      CPU: {
        インストーラー: {
          url: `https://github.com/VOICEVOX/voicevox/releases/download/${APP_VERSION}/VOICEVOX-CPU.Web.Setup.${APP_VERSION}.exe`,
          name: `VOICEVOX-CPU.Setup.${APP_VERSION}.Windows.exe`,
        },
        Zip: {
          url: `https://github.com/VOICEVOX/voicevox/releases/download/${APP_VERSION}/voicevox-windows-cpu-${APP_VERSION}.zip`,
          name: `VOICEVOX-CPU.${APP_VERSION}.Windows.zip`,
        },
      },
    },
    Mac: {
      CPU: {
        インストーラー: {
          url: `https://github.com/VOICEVOX/voicevox/releases/download/${APP_VERSION}/VOICEVOX.${APP_VERSION}.dmg`,
          name: `VOICEVOX.${APP_VERSION}.Mac.dmg`,
        },
        Zip: {
          url: `https://github.com/VOICEVOX/voicevox/releases/download/${APP_VERSION}/voicevox-macos-cpu-${APP_VERSION}.zip`,
          name: `VOICEVOX-CPU.${APP_VERSION}.Mac.zip`,
        },
      },
    },
    Linux: {
      "GPU / CPU": {
        インストーラー: {
          url: scriptNodes.find(value => value.name == "linuxInstallNvidia")!
            .publicURL,
          name: `VOICEVOX.Installer.${APP_VERSION}.Linux.sh`,
        },
      },
      CPU: {
        インストーラー: {
          url: scriptNodes.find(value => value.name == "linuxInstallCpu")!
            .publicURL,
          name: `VOICEVOX-CPU.Installer.${APP_VERSION}.Linux.sh`,
        },
        "tar.gz": {
          url: `https://github.com/VOICEVOX/voicevox/releases/download/${APP_VERSION}/voicevox-linux-cpu-${APP_VERSION}.tar.gz`,
          name: `VOICEVOX-CPU.${APP_VERSION}.Linux.tar.gz`,
        },
      },
    },
  }

  const [selectedOs, setSelectedOs] = useState<OsType>("Windows")
  const [selectedMode, setSelectedMode] = useState<ModeType>("GPU / CPU")
  const [selectedPackage, setSelectedPackage] =
    useState<PackageType>("インストーラー")

  // 存在しない組み合わせのときに選択中のものを変更する
  useEffect(() => {
    if (!modeAvailables[selectedOs].find(value => value == selectedMode)) {
      setSelectedMode(modeAvailables[selectedOs][0])
    }
    if (
      !packageAvailables[selectedOs][selectedMode].find(
        value => value == selectedPackage
      )
    ) {
      setSelectedPackage(packageAvailables[selectedOs][selectedMode][0])
    }
  }, [selectedOs, selectedMode, selectedPackage])

  return (
    <div
      className={"modal-download modal" + (props.isActive ? " is-active" : "")}
    >
      <div
        className="modal-background"
        onClick={props.hide}
        role="presentation"
      />
      <div className="modal-card">
        {!maintenanceMode ? (
          <>
            <header className="modal-card-head has-text-centered">
              <p className="modal-card-title">ダウンロード選択</p>
              <button
                className="delete"
                aria-label="close"
                onClick={props.hide}
                type="button"
              ></button>
            </header>

            <section className="modal-card-body">
              <DownloadModalSelecter
                label="OS"
                selected={selectedOs}
                setSelected={setSelectedOs}
                candidates={["Windows", "Mac", "Linux"]}
              />

              <hr className="my-3" />

              <DownloadModalSelecter
                label="対応モード"
                selected={selectedMode}
                setSelected={setSelectedMode}
                candidates={modeAvailables[selectedOs]}
              />
              <p className="has-text-centered is-size-7">
                ※ GPUモードの方が快適ですが、利用するためには
                <Link to="/qa">対応するGPU</Link>
                が必要です
              </p>

              <hr className="my-3" />

              <DownloadModalSelecter
                label="パッケージ"
                selected={selectedPackage}
                setSelected={setSelectedPackage}
                candidates={packageAvailables[selectedOs][selectedMode]}
              />
              <p className="has-text-centered is-size-7">
                ※ 推奨パッケージはインストーラー版です
              </p>
            </section>

            <footer className="modal-card-foot is-justify-content-flex-end">
              <a
                href={
                  downloadUrls[selectedOs][selectedMode]?.[selectedPackage]?.url
                }
                download={
                  downloadUrls[selectedOs][selectedMode]?.[selectedPackage]
                    ?.name
                }
                target="_blank"
                rel="noreferrer"
                className="button is-primary"
                type="button"
                role={"button"}
              >
                <span className="has-text-weight-semibold">ダウンロード</span>
              </a>
            </footer>
          </>
        ) : (
          <>
            <header className="modal-card-head has-text-centered">
              <p className="modal-card-title">メンテナンス中です</p>
              <button
                className="delete"
                aria-label="close"
                onClick={props.hide}
                type="button"
              ></button>
            </header>

            <section className="modal-card-body">
              <p className="has-text-centered is-size-5">
                アップデートのためのメンテナンス中です。
                <br />
                しばらくお待ち下さい。
              </p>
            </section>

            <footer className="modal-card-foot is-justify-content-flex-end">
              <button onClick={props.hide} className="button" type="button">
                <span>閉じる</span>
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
