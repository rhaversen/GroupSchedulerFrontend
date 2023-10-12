import styles from './InputField.module.scss'

function InputField ({ type, name, label, autoComplete, value, onChange, errorMessage, color }) {
  return (
        <div className={styles.labelContainer}>
            <label className={styles.label}>{label}</label>
            <div className={styles.inputContainer}>
                <input
                    className={styles.input}
                    type={type} name={name}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={onChange}
                />
                <div className={styles.errorContainer}>
                    {errorMessage && <span className={styles.error} style={{ color }}>{errorMessage}</span>}
                </div>
            </div>
        </div>
  )
}

export default InputField
