import React, { lazy, useState, useEffect } from 'react'
import {
  CCard,
  CButton,
  CCardBody
} from '@coreui/react'
import TextField from '@material-ui/core/TextField';
import {
    alpha,
    makeStyles,
  } from '@material-ui/core/styles';
// import {
//     MuiPickersUtilsProvider,
//     KeyboardTimePicker,
//     KeyboardDatePicker,
//   } from '@material-ui/pickers';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { userService } from '../../controllers/_services';
import { successNotification, warningNotification } from '../../controllers/_helpers';

const useStylesReddit = makeStyles((theme) => ({
    root: {
      border: 'none',
      overflow: 'hidden',
      backgroundColor: '#fcfcfb',
      fontWeight: '700',
      lineHeight: '24px',
      fontSize: '24px',
      color: "green",
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:hover': {
        backgroundColor: '#fff',
      },
      '&$focused': {
        backgroundColor: '#fff',
        boxShadow: `${alpha("#24242f", 0.25)} 0 0 0 1px`,
        borderRadius: 4,
        borderColor: "#24242f",
        borderBottom: "2px solid black",
        color: "green"
      }
    },
    focused: {},
  }));

function RedditTextField(props) {
    const classes = useStylesReddit();
  
    return <TextField InputProps={{ classes, disableUnderline: true }} {...props} />;
  }

const PersionalInfoSetting = () => {
 const dispatch = useDispatch()
 const history = useHistory()
 
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [firstName, setFirstName] = useState()
 const [lastName, setLastName] = useState()
 const [phoneNumber, setPhoneNumber] = useState()
 const [email, setEmail] = useState()

 const user = useSelector(state => state.user)
 
 useEffect(() => {
    if (localStorage.getItem('userId') && user) {
        setFirstName(user.first_name)
        setLastName(user.last_name)
        setPhoneNumber(user.phone_number)
        setEmail(user.email)
    }
 }, [user]);
  
  const onSubmit = () => {
      if (user) {
          const newUser = {
              ...user,
              "first_name": firstName,
              "last_name": lastName,
              "phone_number": phoneNumber
          }
          setIsSubmitting(true);
          userService.update(newUser).then(
              result => {
                  console.log(result)
                  dispatch({type: 'set', user: newUser})
                  successNotification("Updated your profile successfully", 3000)
                  setIsSubmitting(false)
              },
              error => {
                  warningNotification(error, 3000)
                  setIsSubmitting(false)
              }
          )
      }
  }
  // render
  return (

    <CCard color="transparent" className="d-box-shadow1 d-border">
        <CCardBody className="card-setting m-0">

            <div className="d-flex mt-3">
                {
                    <RedditTextField
                        id="first-name"
                        label="First name"
                        placeholder="First name"
                        value={firstName}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        variant="filled"
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                }
            </div>
            <div className="d-flex mt-3">
                {
                    <RedditTextField
                        id="last-name"
                        label="Last name"
                        placeholder="Last name"
                        value={lastName}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        variant="filled"
                        onChange={(e) => setLastName(e.target.value)}
                    />
                }
            </div>

            <div className="d-flex mt-3">
                {
                    <RedditTextField
                        id="phone-number"
                        label="Phone number"
                        placeholder="Phone number"
                        value={phoneNumber}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        variant="filled"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                }
            </div>

            <div className="d-flex mt-0 float-right">
                <CButton className="button-exchange" onClick={() => onSubmit()} disabled={isSubmitting}>
                    {isSubmitting ? 'Wait...' : 'Update'}
                </CButton>
            </div>
        </CCardBody>
    </CCard>

    )
}

export default PersionalInfoSetting
