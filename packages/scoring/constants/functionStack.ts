/**
 * 심리기능 위계 상수 + 도출 알고리즘 (§5.3)
 * ─ 계약(lib/contract)의 FUNCTION_STACK을 단일 소스로 re-export(미러, ADR-5).
 * ─ deriveFunctionStack: PRD §5.3 도출 알고리즘. 채점 산출은 FUNCTION_STACK 조회를 쓰고,
 *   골든 테스트에서 derive == 내장표(16행) 100% 일치를 이중 검증한다(표·알고리즘 둘 다 옳아야).
 */
import type { Function8, FunctionStack, TypeCode } from '../../../lib/contract';
import { FUNCTION_STACK } from '../../../lib/contract';

export { FUNCTION_STACK };
export type { Function8, FunctionStack, TypeCode };

/**
 * 기능의 "반대 기능(태도 포함 반전)" — 열등/3차 도출용.
 * 범주 문자 반전(S↔N, T↔F) + 태도 반전(e↔i).
 * Se↔Ni · Si↔Ne · Te↔Fi · Ti↔Fe.
 */
export function oppositeFunction(fn: Function8): Function8 {
  const letter = fn[0] as 'S' | 'N' | 'T' | 'F';
  const attitude = fn[1] as 'e' | 'i';
  const flipLetter: Record<'S' | 'N' | 'T' | 'F', string> = { S: 'N', N: 'S', T: 'F', F: 'T' };
  const flipAtt = attitude === 'e' ? 'i' : 'e';
  return (flipLetter[letter] + flipAtt) as Function8;
}

/**
 * §5.3 도출 알고리즘 (유형코드 → 4기능 위계).
 *  - J → 판단기능(T/F) 외향화 · P → 인식기능(S/N) 외향화
 *  - E → 외향기능이 주기능 · I → 내향기능이 주기능
 *  - 부기능 = 반대태도·반대범주(= 나머지 한 기능)
 *  - 3차 = 부기능의 반대기능 · 열등 = 주기능의 반대기능(태도 포함 반전)
 */
export function deriveFunctionStack(type: TypeCode): FunctionStack {
  const attitude = type[0] as 'E' | 'I';
  const perceiving = type[1] as 'S' | 'N'; // 인식기능 문자
  const judging = type[2] as 'T' | 'F'; // 판단기능 문자
  const orient = type[3] as 'J' | 'P';

  // 외향화되는 기능 결정
  const extFn = (orient === 'J' ? judging + 'e' : perceiving + 'e') as Function8;
  const introFn = (orient === 'J' ? perceiving + 'i' : judging + 'i') as Function8;

  const dominant = attitude === 'E' ? extFn : introFn;
  const auxiliary = attitude === 'E' ? introFn : extFn;
  const tertiary = oppositeFunction(auxiliary);
  const inferior = oppositeFunction(dominant);

  return { dominant, auxiliary, tertiary, inferior };
}
