/*export default function Demo() {
    
    return (
        <div>
            <h1>SolanPay</h1>
            <h1>pay never were is easy as see the sun</h1>
            
        </div>
    );
}*/

import toast, { Toaster } from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Connection,
    SystemProgram,
    Transaction,
    PublicKey,
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    SendTransactionError,
} from "@solana/web3.js";
import { useStorageUpload } from "@thirdweb-dev/react";

import axios from "axios";

const SOLANA_NETWORK = "devnet";

const Home = () => {
    const [publicKey, setPublicKey] = useState(null);
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState(null);
    const [explorerLink, setExplorerLink] = useState(null);

    const [uploadUrl, setUploadUrl] = useState(null);
    const [url, setUrl] = useState(null);
    const [statusText, setStatusText] = useState("");

    useEffect(() => {
        let key = window.localStorage.getItem("publicKey"); //obtiene la publicKey del localStorage
        setPublicKey(key);
        if (key) getBalances(key);
        if (explorerLink) setExplorerLink(null);
    }, []);

    

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    };

    const handleSubmit = async () => {
        console.log("Este es el monto", amount);
        sendTransaction();
    };

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
        console.log("Si se esta seteando la URL", url);
    };

    //Funcion para Iniciar sesion con nuestra Wallet de Phantom

    const signIn = async () => {
        //Si phantom no esta instalado
        const provider = window?.phantom?.solana;
        const { solana } = window;

        if (!provider?.isPhantom || !solana.isPhantom) {
            toast.error("Phantom no esta instalado");
            setTimeout(() => {
                window.open("https://phantom.app/", "_blank");
            }, 2000);
            return;
        }
        //Si phantom esta instalado
        let phantom;
        if (provider?.isPhantom) phantom = provider;

        const { publicKey } = await phantom.connect(); //conecta a phantom
        console.log("publicKey", publicKey.toString()); //muestra la publicKey
        setPublicKey(publicKey.toString()); //guarda la publicKey en el state
        window.localStorage.setItem("publicKey", publicKey.toString()); //guarda la publicKey en el localStorage

        toast.success("Your Wallet is connected 👻");

        getBalances(publicKey);
    };

    //Funcion para cerrar sesion con nuestra Wallet de Phantom

    const signOut = async () => {
        if (window) {
            const { solana } = window;
            window.localStorage.removeItem("publicKey");
            setPublicKey(null);
            solana.disconnect();
            router.reload(window?.location?.pathname);
        }
    };

    //Funcion para obtener el balance de nuestra wallet

    const getBalances = async (publicKey) => {
        try {
            const connection = new Connection(
                clusterApiUrl(SOLANA_NETWORK),
                "confirmed"
            );

            const balance = await connection.getBalance(
                new PublicKey(publicKey)
            );

            const balancenew = balance / LAMPORTS_PER_SOL;
            setBalance(balancenew);
        } catch (error) {
            console.error("ERROR GET BALANCE", error);
            toast.error("Something went wrong getting the balance");
        }
    };

    //Funcion para enviar una transaccion
    const sendTransaction = async () =>
 { const provider=false; 

        console.log("ayyy me voy a transaccionar")
        try {
            //Consultar el balance de la wallet
            getBalances(publicKey);
            console.log("Este es el balance", balance);

            //Si el balance es menor al monto a enviar
            if (balance < amount) {
                toast.error("No tienes suficiente balance");
                return;
            }

            console.log("si hay balance: " + balance)

            const provider = window?.phantom?.solana;
            const connection = new Connection(
                clusterApiUrl(SOLANA_NETWORK),
                "confirmed"
            );

            //Llaves
                console.log("public key", publicKey);
                const toKey = "4pugDMTKmQXrhF9EhVzNYU8CerUfyGhEX3kNhnXakNWf"
            const fromPubkey = new PublicKey(publicKey);
            const toPubkey = new PublicKey(toKey);

            console.log("Esta es la fromPubkey", fromPubkey);
            console.log("Esta es la toPubkey", toPubkey);



            //Creamos la transaccion
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );
            console.log("Esta es la transaccion", transaction);

            //Traemos el ultimo blocke de hash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            //Firmamos la transaccion
            const transactionsignature = await provider.signTransaction(
                transaction
            );

            //Enviamos la transaccion
            const txid = await connection.sendRawTransaction(
                transactionsignature.serialize()
            );
            console.info(`Transaccion con numero de id ${txid} enviada`);

            //Esperamos a que se confirme la transaccion
            const confirmation = await connection.confirmTransaction(txid, {
                commitment: "singleGossip",
            });

            const { slot } = confirmation.value;

            console.info(
                `Transaccion con numero de id ${txid} confirmado en el bloque ${slot}`
            );

            const solanaExplorerLink = `https://explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
            setExplorerLink(solanaExplorerLink);

            toast.success("Transaccion enviada con exito :D ");

            //Actualizamos el balance
            getBalances(publicKey);
            setAmount(null);

            return solanaExplorerLink;
        } catch (error) {
            console.error("ERROR SEND TRANSACTION", error);
            toast.error("Error al enviar la transaccion");
        }
    };

    //Función para subir archivos a IPFS

    useStorageUpload();

    
   

    return (
        <div className="h-screen bg-blue">
            <div className="flex flex-col  w-auto h-auto  bg-black"style={{ backgroundColor: '#ECBD0D' }} >
                
                    {publicKey ? (
                        <div className="flex flex-col py-24 place-items-center justify-center">

                            <h1 className="text-2xl font-bold text-white">
                             Your wallet number is: {publicKey.substring(0, 4)}
                            </h1>
                        	
                            <br />
                            <h1 className="text-2xl font-bold text-white">
                             Your current balance is: {balance} Solanas
                
                            </h1>
                            <br />

                            <h1 className="text-2xl font-bold text-white">
                                Your solanas in current price are: ${balance * 8.83} dlls
                                

                            </h1>
                            <br />
                            <h1 className="text-2xl font-bold text-white">
                                Select the service which you want to pay
                                

                            </h1>
                            <select id="miListaDesplegable">
                                <option value="CFE">CFE</option>
                                <option value="CESPT" selected>CESPT</option>
                                <option value="INFINITUM">INFINITUM</option>
                                </select>
                                <br />
                            <h1 className="text-2xl  text-white">
                             Amount of SOL you going :
                            </h1>
                            <input
                                className="h-8 w-72 mt-4   border-2 border-black "
                                type="text"
                                onChange={handleAmountChange}
                            />
                            <br />
                            <button
                                type="submit"
                                className="inline-flex h-8 w-52 justify-center bg-white font-bold text-black"
                                onClick={() => {
                                    handleSubmit();
                                }}
                            >
                                 Pay ⚡
                            </button>
                            
                                
                            <a href={explorerLink}>
                                <h1 className="text-md font-bold text-sky-500">
                                    {explorerLink}
                                </h1>
                            </a>
                           

                            <p className="text-white font-bold mb-8">
                                {statusText}
                            </p>

                            

                            {uploadUrl ? (
                                <button
                                    className="inline-flex h-8 w-52 justify-center bg-purple-500 font-bold text-white"
                                    onClick={() => {
                                        generateNFT();
                                    }}
                                >
                                    To create NFT 🔥
                                </button>
                            ) : (
                                <></>
                            )}

                                <br/>

                            <button
                                type="submit"
                                className="inline-flex h-8 w-52 justify-center bg-white font-bold text-black"
                                onClick={() => {
                                    signOut();
                                }}
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col place-items-center justify-center">
                            {/* esto sale cuando no esta logeado al wallet  */}
                            <div className="flex flex-col py-24 place-items-center justify-center">
                                <img
                                src="https://scontent-lax3-2.xx.fbcdn.net/v/t1.15752-9/370244370_7000751626643854_4819210957781700503_n.png?_nc_cat=111&ccb=1-7&_nc_sid=8cd0a2&_nc_ohc=SpIjcGdlmCIAX80Yo21&_nc_ht=scontent-lax3-2.xx&oh=03_AdRMRTz1ZV_aiRY_jvheiYxLiMfx9gPhApzgJvl9SXxtuA&oe=655055D6"
                                width={600}
                                height={700}
                                alt="SolanPay Logo"
                                />
                                <br>
                                </br>
                            

                                <h1 className="text-5xl font-bold pb-10 text-amber-500">   
                                Welcome to SolanPay
                                </h1>
                               </div> 
                            <button type="submit"
                                className="inline-flex h-8 w-52 justify-center bg-blue-500 font-bold text-white"
                                onClick={() => {
                                    signIn();
                                }}
                            >
                                
                                <h1>Log in</h1>
                            </button>
                        </div>
                    )}
                </div>
                <Toaster position="bottom-center" />
            </div>
    );
};

export default Home;
