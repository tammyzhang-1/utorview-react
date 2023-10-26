'use client'
import styles from '../page.module.css'; 

export default function Select({id, label, options, selectedValue, setSelectedValue}) {
    console.log("render occurred! Select")
    const optionList = options.map( (option, i) =>
        <option key={option} value={i}>{option}</option>
    );

    return (
    <div className="selectComponent">
        <label className={styles.select}>
            {label}: 
            <select name={id} value={selectedValue} onChange={e => setSelectedValue(e.target.value)}>
                {optionList}
            </select>
        </label>
    </div>
    );
}