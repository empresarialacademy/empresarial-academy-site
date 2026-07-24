'use client';
import React, { useRef } from 'react';
import { FormSubmit, useForm, useOperation } from '@payloadcms/ui';

/**
 * Botão "Publicar" ao lado do "Salvar" nativo. O projeto optou por NÃO usar o
 * sistema de rascunhos/versões nativo do Payload (evita um 2º status
 * conflitando com o campo `status` manual já existente — ver PROJECT_STATUS)
 * — por isso o `PublishButton` nativo do Payload nunca aparece. Este é um
 * substituto simples: salva com `status: "published"` num único clique, sem
 * precisar trocar o Status no menu lateral primeiro. Não precisa mandar
 * `publishedAt` — o `beforeChange` da coleção já preenche automaticamente
 * quando ausente (preserva uma data definida à mão, se houver).
 */
export function PublishButton() {
  const { submit } = useForm();
  const operation = useOperation();
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    void submit({ overrides: { status: 'published' } });
  };

  return (
    <FormSubmit
      buttonId="action-publish"
      buttonStyle="primary"
      onClick={handleClick}
      ref={ref}
      size="medium"
      type="button"
    >
      {operation === 'update' ? 'Publicar' : 'Salvar e publicar'}
    </FormSubmit>
  );
}
