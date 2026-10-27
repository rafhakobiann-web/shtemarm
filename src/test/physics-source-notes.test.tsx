import { beforeEach,describe,expect,it,vi } from "vitest";
import { fireEvent,render,screen } from "@testing-library/react";
import { PhysicsSourceNotes,readPhysicsSourceAnswers,savePhysicsSourceAnswers,
  type SourceAnswer } from "@/components/PhysicsSourceNotes";

beforeEach(()=>{window.localStorage.clear();});
const answer:SourceAnswer={
  id:"source-1",question:145,page:34,answer:"3",checked:false,date:"2026-10-27T10:00:00.000Z",
};
describe("original source-book private answer notebook",()=>{
  it("keeps written attempts in the selected book, not another book",()=>{
    expect(readPhysicsSourceAnswers(61)).toEqual([]);
    expect(savePhysicsSourceAnswers(61,[answer])).toBe(true);
    expect(readPhysicsSourceAnswers(61)).toEqual([answer]);
    expect(readPhysicsSourceAnswers(62)).toEqual([]);
    expect(savePhysicsSourceAnswers(62,[{...answer,id:"source-2",answer:"125"}])).toBe(true);
    expect(readPhysicsSourceAnswers(61)).toEqual([answer]);
    expect(readPhysicsSourceAnswers(62)[0]?.answer).toBe("125");
  });
  it("ignores invalid or corrupted stored answers",()=>{
    window.localStorage.setItem("shtemarm-physics-source-notes-v1:61","broken json");
    expect(readPhysicsSourceAnswers(61)).toEqual([]);
    window.localStorage.setItem("shtemarm-physics-source-notes-v1:61",JSON.stringify([
      {...answer,question:-1},{...answer,page:88888},answer,
    ]));
    expect(readPhysicsSourceAnswers(61)).toEqual([answer]);
  });
  it("records a book question, opens its source page and answer table without guessing scores",()=>{
    const onJump=vi.fn();
    render(<PhysicsSourceNotes volume={61} page={18} onJump={onJump}/>);
    fireEvent.change(screen.getByRole("spinbutton"),{target:{value:"52"}});
    fireEvent.change(screen.getByPlaceholderText("Տարբերակի համարը կամ թվային արժեքը"),{
      target:{value:"4"},
    });
    fireEvent.click(screen.getByRole("button",{name:"Պահպանել"}));
    expect(readPhysicsSourceAnswers(61)).toMatchObject([{question:52,page:18,answer:"4",checked:false}]);
    fireEvent.click(screen.getByRole("button",{name:/№ 52/}));
    expect(onJump).toHaveBeenLastCalledWith(18);
    fireEvent.click(screen.getByRole("button",{name:"Բացել գրքի պատասխանների աղյուսակը"}));
    expect(onJump).toHaveBeenLastCalledWith(406);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(readPhysicsSourceAnswers(61)[0]?.checked).toBe(true);
    expect(screen.queryByText(/ճիշտ է քո պատասխանը/)).not.toBeInTheDocument();
  });
});
