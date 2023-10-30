'use client'
import styles from '../page.module.css'; 

export default function Select({label, options, values, selectedValue, setSelectedValue}) {
    console.log("render occurred! Select")
    const optionList = options.map( (option, i) =>
        <option key={option} value={values[i]}>{option}</option>
    );

    return (
    <div className="selectComponent">
        <label className={styles.select}>
            {label}: 
            <select name={label} value={selectedValue} onChange={e => setSelectedValue(e.target.value)}>
                {optionList}
            </select>
        </label>
    </div>
    );
}