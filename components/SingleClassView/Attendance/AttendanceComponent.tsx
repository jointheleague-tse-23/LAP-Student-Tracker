import React, { useContext, useState, useEffect } from "react";
import styles from "./attendance.module.css";
import { AttendanceBox } from "./AttendanceBox";
import { APIContext } from "../../../context/APIContext";
import { CustomLoader } from "../../util/CustomLoader";
import { DateTime } from "luxon";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { Attendance } from "../../../models";

type AttendanceComponentProps = {
  classId: string;
};
export const AttendanceComponent: React.FC<AttendanceComponentProps> = ({ classId }) => {
  const api = useContext(APIContext);

  const [date, setDate] = useState<DateTime>(DateTime.fromJSDate(new Date()));
  const [loading, setLoading] = useState<boolean>(true);
  const [attendances, setAttendance] = useState<Attendance[]>([]);
  const [sessionID, setSessionID] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const sessions = await api.getSessions(
        classId,
        date.set({ hour: 0, minute: 0 }).toUTC().toISO()
      );
      if (sessions.length == 0) {
        setAttendance([]);
        setLoading(false);
        return <p>This date has no sessions</p>;
      }
      setSessionID(sessions[0].sessionId);
      const sessionId = sessions[0].sessionId;
      const attendances = await api.getAttendanceFromSessionID(sessionId, classId);
      setAttendance(attendances);
      setLoading(false);
    })();
  }, [date]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>Attendance</div>
      <div className={styles.dateContainer}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={date}
            className={styles.dateInput}
            onChange={(newDate) => {
              setDate(newDate ? newDate : date);
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </div>
      {loading ? (
        <CustomLoader></CustomLoader>
      ) : (
        <AttendanceBox
          attendances={attendances}
          classId={classId}
          sessionId={sessionID}
        ></AttendanceBox>
      )}
    </div>
  );
};