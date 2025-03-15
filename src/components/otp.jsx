import { useRef, useState } from "react"
import { Button } from "./button";

export function Otp() {
    const ref1 = useRef();
    const ref2 = useRef();
    const ref3 = useRef();
    const ref4 = useRef();
    const ref5 = useRef();
    const ref6 = useRef();

    const [disabled,setDisabled] = useState(true);

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-center mb-4">
                <SubOtpBox reference={ref1} onDone={() => {
                    ref2.current.focus();
                }}/>
                <SubOtpBox reference={ref2} onDone={() => {
                    ref3.current.focus();
                }} onBack={() => {
                    ref1.current.focus();
                }}/>
                <SubOtpBox reference={ref3} onDone={() => {
                    ref4.current.focus();
                }} onBack={() => {
                    ref2.current.focus();
                }}/>
                <SubOtpBox reference={ref4} onDone={() => {
                    ref5.current.focus();
                }} onBack={() => {
                    ref3.current.focus();
                }}/>
                <SubOtpBox reference={ref5} onDone={() => {
                    ref6.current.focus();
                }} onBack={() => {
                    ref4.current.focus();
                }}/>
                <SubOtpBox reference={ref6} onDone={() => {
                    setDisabled(false)
                }} onBack={() => {
                    ref5.current.focus();
                }}/>
            </div>
            <Button disabled={disabled}>Sign Up</Button>
        </div>
    )
}

function SubOtpBox({
    reference,onDone,onBack
}) {

    const [inputBoxVal,setInputBoxVal] = useState("");

    return <div>
        <input value={inputBoxVal} ref={reference} onChange={(e) => {
            const val = e.target.value
            if (val == "") {
                setInputBoxVal("")
                onBack()
            } else if (!isNaN(val) && val.length==1) {
                setInputBoxVal(val);
                onDone();
            } else {

            }
        }} type="text" maxLength={1} className="w-[40px] h-[50px] rounded-2xl bg-blue-500 m-1 text-center"></input>
    </div>
}