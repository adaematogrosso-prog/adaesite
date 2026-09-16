import {
  EDUCATION_LEVEL_OPTIONS,
  type IsMasonFormValue,
} from "@/lib/members/profile-fields";

type Props = {
  profession: string;
  educationLevel: string;
  isMason: IsMasonFormValue;
  onProfessionChange: (value: string) => void;
  onEducationLevelChange: (value: string) => void;
  onIsMasonChange: (value: IsMasonFormValue) => void;
  onProfessionBlur?: () => void;
  idPrefix?: string;
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-gold/20 px-4 py-2.5 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export function MemberProfileExtraFields({
  profession,
  educationLevel,
  isMason,
  onProfessionChange,
  onEducationLevelChange,
  onIsMasonChange,
  onProfessionBlur,
  idPrefix = "profile",
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label
          htmlFor={`${idPrefix}-profession`}
          className="block text-sm font-medium text-foreground"
        >
          Profissão
        </label>
        <input
          id={`${idPrefix}-profession`}
          name="profession"
          type="text"
          value={profession}
          onChange={(event) => onProfessionChange(event.target.value)}
          onBlur={onProfessionBlur}
          className={inputClassName}
          placeholder="Ex.: Engenheiro, Advogado..."
        />
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-education-level`}
          className="block text-sm font-medium text-foreground"
        >
          Escolaridade
        </label>
        <select
          id={`${idPrefix}-education-level`}
          name="educationLevel"
          value={educationLevel}
          onChange={(event) => onEducationLevelChange(event.target.value)}
          className={inputClassName}
        >
          {EDUCATION_LEVEL_OPTIONS.map((option) => (
            <option key={option.value || "empty"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <fieldset>
          <legend className="block text-sm font-medium text-foreground">
            Já é maçon?
          </legend>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="isMason"
                value="yes"
                checked={isMason === "yes"}
                onChange={() => onIsMasonChange("yes")}
                className="h-4 w-4 accent-royal-blue"
              />
              Sim
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="isMason"
                value="no"
                checked={isMason === "no"}
                onChange={() => onIsMasonChange("no")}
                className="h-4 w-4 accent-royal-blue"
              />
              Não
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
