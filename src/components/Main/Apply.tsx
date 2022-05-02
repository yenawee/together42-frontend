import React, { useEffect, useRef, useState } from 'react';
import '@css/Main/Apply.scss';
import axios from 'axios';
import GlobalLoginState from '@recoil/GlobalLoginState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { getToken } from '@cert/TokenStorage';
import SelectedEvent from '@recoil/SelectedEvent';
import { EventType } from '@usefulObj/types';
import ApplyTeamMemArr from '@recoil/ApplyTeamMemArr';
import errorAlert from '@utils/errorAlert';

function Apply() {
  const LoginState = useRecoilValue(GlobalLoginState);
  const [EventList, setEventList] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType>({
    id: null,
    title: null,
    description: null,
    createdBy: null,
  });
  const [globalSelectedEvent, setGlobalSelectedEvent] = useRecoilState(SelectedEvent);
  const [teamList, setTeamList] = useRecoilState(ApplyTeamMemArr);
  const [createMode, setCreateMode] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const ListWrapperRef = useRef(null);

  const onClickCreateModal = () => {
    setCreateMode(true);
  };

  const onSubmitCreate = (e) => {
    e.preventDefault();
    if (LoginState.isLogin) {
      axios
        .post(
          `${process.env.SERVER_ADR}/api/together`,
          {
            title: createTitle,
            description: createDescription,
          },
          {
            headers: {
              Authorization: 'Bearer ' + getToken(),
            },
          },
        )
        .then(() => {
          alert('생성되었습니다');
          setCreateMode(false);
        })
        .catch((err) => errorAlert(err));
    } else {
      alert('로그인을 하셔야 생성 가능합니다!');
    }
  };

  const onChange = (e) => {
    if (e.target.id === 'title') {
      setCreateTitle(e.target.value);
    } else {
      setCreateDescription(e.target.value);
    }
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (LoginState.isLogin) {
      axios
        .post(
          `${process.env.SERVER_ADR}/api/together/register`,
          {
            eventId: selectedEvent.id,
          },
          {
            headers: {
              Authorization: 'Bearer ' + getToken(),
            },
          },
        )
        .then(() => {
          alert('신청되셨습니다');
          axios
            .get(`${process.env.SERVER_ADR}/api/together/matching/${selectedEvent.id}`)
            .then((res) => {
              if (res.data.teamList && Object.keys(res.data.teamList).length) setTeamList(res.data.teamList['null']);
              else setTeamList([]);
            })
            .catch((err) => errorAlert(err));
        })
        .catch((err) => errorAlert(err));
    } else {
      alert('로그인을 하셔야 신청 가능합니다!');
    }
  };

  const onClickEventList = (e) => {
    const clickedEvent = EventList.find((ev) => ev.id === parseInt(e.target.id, 10));
    setCreateMode(false);
    setSelectedEvent(clickedEvent);
    setGlobalSelectedEvent(clickedEvent);
  };

  useEffect(() => {
    axios
      .get(`${process.env.SERVER_ADR}/api/together`)
      .then((response) => {
        response.data.EventList.forEach((e: EventType) => {
          axios
            .get(`${process.env.SERVER_ADR}/api/together/matching/${e.id}`)
            .then((res) => {
              if (
                (res.data.teamList && res.data.teamList['null']) ||
                (res.data.teamList && Object.keys(res.data.teamList).length === 0)
              )
                setEventList((prev) => {
                  let rtnArr = [...prev];
                  if (!prev.find((prevElem) => prevElem['id'] === e['id'])) {
                    rtnArr.push(e);
                  }
                  return rtnArr;
                });
            })
            .catch((matchingErr) => errorAlert(matchingErr));
        });
      })
      .catch((err) => errorAlert(err));
    return () => {
      setGlobalSelectedEvent({
        id: null,
        title: null,
        description: null,
        createdBy: null,
      });
    };
  }, [setGlobalSelectedEvent, createMode]);

  useEffect(() => {
    window.scrollTo(0, ListWrapperRef.current.offsetTop);
  }, [teamList]);

  useEffect(() => {
    if (selectedEvent.id) {
      axios
        .get(`${process.env.SERVER_ADR}/api/together/matching/${selectedEvent.id}`)
        .then((res) => {
          if (res.data.teamList && Object.keys(res.data.teamList).length) setTeamList(res.data.teamList['null']);
          else setTeamList([]);
        })
        .catch((err) => errorAlert(err));
    }
  }, [selectedEvent.id, setTeamList]);

  return (
    <div className="main--apply">
      <p className="main--apply--title" ref={ListWrapperRef}>
        {LoginState.id === '' ? '로그인 후 신청 가능!' : `${LoginState.id}님, 신청하시죠?`}
      </p>
      <div className="main--apply--wrapper">
        <div className="main--apply--create_modal_button">
          <span onClick={onClickCreateModal}>친바 생성하기</span>
        </div>
        <div className="main--apply--list">
          <p className="main--apply--list--title">신청 가능 목록</p>
          {EventList.length > 0 ? (
            EventList.map((e, i) => (
              <p className="main--apply--list--event" key={i}>
                <span id={`${e.id}`} onClick={onClickEventList}>
                  - {e.title}
                </span>
              </p>
            ))
          ) : (
            <p className="main--apply--list--empty">이벤트가 없습니다</p>
          )}
        </div>
        {EventList.length > 0 && !createMode ? (
          <div className="main--apply--eventInfo">
            {selectedEvent.id ? (
              <>
                <p className="main--apply--eventInfo--title">{selectedEvent.title}</p>
                <span className="main--apply--eventInfo--description">{selectedEvent.description}</span>
                <div className="main--apply--eventInfo--submit">
                  <span onClick={onSubmit}>신청하기</span>
                </div>
              </>
            ) : (
              <p className="main--apply--eventInfo--empty">이벤트를 클릭해주세요</p>
            )}
          </div>
        ) : createMode ? (
          <div className="main--apply--create_wrapper">
            <form className="main--apply--create_form" onSubmit={onSubmitCreate}>
              <div className="main--apply--create_input_wrapper">
                <div className="main--apply--create_input_label">
                  <span>친바제목</span>
                </div>
                <input
                  className="main--apply--create_input"
                  id="title"
                  placeholder="친바제목입력"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = '친바제목입력')}
                  onChange={onChange}
                ></input>
              </div>
              <div className="main--apply--create_textarea_wrapper">
                <div className="main--apply--create_textarea_label">
                  <span>친바설명</span>
                </div>
                <textarea
                  className="main--apply--create_textarea"
                  id="description"
                  placeholder="친바설명입력"
                  onFocus={(e) => (e.target.placeholder = '')}
                  onBlur={(e) => (e.target.placeholder = '친바설명입력')}
                  rows={5}
                  onChange={onChange}
                ></textarea>
              </div>
              <div className="main--apply--create_button_wrapper">
                <button className="main--apply--create_button">
                  <span>친바생성</span>
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Apply;
