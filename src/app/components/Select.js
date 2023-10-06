import styles from '../page.module.css'; 

export default function Select({label, options}) {
    const optionList = options.map(option =>
        <option key={option}>{option}</option>
      );

    return (
    <div className="selectComponent">
        <label className={styles.select}>
            {label}: 
            <select name={label}>
                {optionList}
            </select>
        </label>
    </div>
    );
}